import type { SplittableActivity } from "@/data/trip-content";
import { SPLITTABLE_ACTIVITIES } from "@/data/trip-content";
import { normalizeCollaborationState } from "@/lib/activities";
import { DEFAULT_HOUSEHOLD_SIZES, DEFAULT_PLANNER_SUGGESTIONS, rsvpKey, type DayId, type HouseholdActivityPlan, type TripCollaborationState } from "@/lib/types";

export interface OptionHeadcountRow {
    household: string;
    count: number;
    confirmed: boolean;
    assumed: boolean;
}

export interface ConfirmedAttendee {
    household: string;
    count: number;
    initials: string;
    isYou: boolean;
}

/** Legacy grouped activities → per-activity keys + option mapping */
const LEGACY_ACTIVITY_MIGRATIONS: Record<
    string,
    { optionToActivity: Record<string, string>; stayActivityId?: string; targetDayId?: DayId }
> = {
    "thu-25:thu-day": {
        optionToActivity: {
            hatchery: "thu-hatchery",
            fishing: "thu-fishing",
            "pool-home": "thu-pool",
        },
        stayActivityId: "thu-pool",
    },
    "thu-25:thu-evening": {
        optionToActivity: {
            "movie-in": "fri-movie",
            "movie-out": "fri-evening-home",
        },
        stayActivityId: "fri-evening-home",
        targetDayId: "fri-26",
    },
    "thu-25:thu-game-evening": {
        optionToActivity: {
            "game-in": "thu-game-night",
            "game-out": "thu-evening-home",
        },
        stayActivityId: "thu-evening-home",
    },
    "fri-26:fri-evening": {
        optionToActivity: {
            "movie-in": "fri-movie",
            "movie-out": "fri-evening-home",
        },
        stayActivityId: "fri-evening-home",
    },
    "fri-26:fri-river": {
        optionToActivity: {
            "knights-ferry": "fri-knights-ferry",
            "river-ranch": "fri-river-ranch",
            "pool-home": "fri-pool",
        },
        stayActivityId: "fri-pool",
    },
};

/** Direct signup keys renamed when activities moved Thu → Fri. */
const RENAMED_SIGNUP_KEYS: Record<string, string> = {
    "thu-25:thu-movie": "fri-26:fri-movie",
    "thu-25:thu-evening-home": "fri-26:fri-evening-home",
};

const HOUSEHOLD_ALIASES: Record<string, string> = {
    "Ian Patterson": "Ian & Kimberly",
};

export function resolveHouseholdName(household: string): string {
    const trimmed = household.trim();
    if (trimmed in DEFAULT_HOUSEHOLD_SIZES) return trimmed;
    if (trimmed in HOUSEHOLD_ALIASES) return HOUSEHOLD_ALIASES[trimmed];
    for (const name of DEFAULT_PLANNER_SUGGESTIONS) {
        if (name === trimmed) return name;
    }
    return trimmed;
}

export function getHouseholdSize(state: TripCollaborationState, household: string): number {
    const canonical = resolveHouseholdName(household);
    if (canonical in DEFAULT_HOUSEHOLD_SIZES) {
        return DEFAULT_HOUSEHOLD_SIZES[canonical];
    }
    return state.householdSizes[canonical] ?? state.householdSizes[household] ?? 4;
}

function normalizeHouseholdSizes(sizes: Record<string, number> | undefined): Record<string, number> {
    const next = { ...(sizes ?? {}) };
    for (const name of Object.keys(DEFAULT_HOUSEHOLD_SIZES)) {
        delete next[name];
    }
    return next;
}

export function householdInitials(household: string): string {
    const parts = household.split(/[\s&,]+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
}

export function migrateActivityPlan(raw: unknown, household: string, state: TripCollaborationState): HouseholdActivityPlan | null {
    if (!raw) return null;
    if (typeof raw === "string") {
        return { optionId: raw, count: getHouseholdSize(state, household), confirmed: true };
    }
    if (typeof raw === "object" && raw !== null && "optionId" in raw) {
        const plan = raw as HouseholdActivityPlan;
        return {
            optionId: plan.optionId,
            count: plan.count ?? 0,
            confirmed: plan.confirmed ?? false,
        };
    }
    return null;
}

function migrateLegacySignups(signups: TripCollaborationState["activitySignups"]): TripCollaborationState["activitySignups"] {
    const next = { ...signups };

    for (const [legacyKey, migration] of Object.entries(LEGACY_ACTIVITY_MIGRATIONS)) {
        const households = next[legacyKey];
        if (!households) continue;

        const dayId = (migration.targetDayId ?? legacyKey.split(":")[0]) as DayId;

        for (const [household, raw] of Object.entries(households)) {
            const plan = migrateActivityPlan(raw, household, { activitySignups: next, householdSizes: {} } as TripCollaborationState);
            if (!plan) continue;

            const familySize = DEFAULT_HOUSEHOLD_SIZES[household] ?? 4;
            const goingCount = Math.min(Math.max(1, plan.count), familySize);
            const targetActivityId = migration.optionToActivity[plan.optionId];
            if (!targetActivityId) continue;

            const primaryKey = rsvpKey(dayId, targetActivityId);
            next[primaryKey] = {
                ...(next[primaryKey] ?? {}),
                [household]: {
                    optionId: plan.optionId,
                    count: goingCount,
                    confirmed: plan.confirmed,
                },
            };

            const remainder = familySize - goingCount;
            const stayId = migration.stayActivityId;
            const stayActivity = stayId ? SPLITTABLE_ACTIVITIES.find((a) => a.id === stayId) : undefined;
            const stayOptionId = stayActivity?.defaultOptionId;
            if (remainder > 0 && stayId && stayOptionId && plan.optionId !== stayOptionId) {
                const stayKey = rsvpKey(dayId, stayId);
                const existing = next[stayKey]?.[household];
                if (!existing?.confirmed) {
                    next[stayKey] = {
                        ...(next[stayKey] ?? {}),
                        [household]: {
                            optionId: stayOptionId,
                            count: remainder,
                            confirmed: plan.confirmed,
                        },
                    };
                }
            }
        }

        delete next[legacyKey];
    }

    for (const [oldKey, newKey] of Object.entries(RENAMED_SIGNUP_KEYS)) {
        const households = next[oldKey];
        if (!households) continue;
        next[newKey] = { ...(next[newKey] ?? {}), ...households };
        delete next[oldKey];
    }

    return next;
}

export function normalizeActivitySignups(state: TripCollaborationState): TripCollaborationState {
    const migrated = migrateLegacySignups(state.activitySignups ?? {});
    const next: TripCollaborationState["activitySignups"] = {};

    for (const [key, households] of Object.entries(migrated)) {
        next[key] = {};
        for (const [household, raw] of Object.entries(households)) {
            const plan = migrateActivityPlan(raw, household, state);
            if (plan) next[key][household] = plan;
        }
    }

    return normalizeCollaborationState({
        ...state,
        activitySignups: next,
        householdSizes: normalizeHouseholdSizes(state.householdSizes),
    });
}

export function findStayOption(activity: SplittableActivity) {
    return activity.options.find(
        (o) => o.id === "pool-home" || o.id === "movie-out" || o.id === "game-out" || /stay/i.test(o.label),
    );
}

export function headcountsForOption(
    activity: SplittableActivity,
    signups: Record<string, HouseholdActivityPlan>,
    optionId: string,
    defaultOptionId: string,
    households: string[],
    state: TripCollaborationState,
): { total: number; rows: OptionHeadcountRow[] } {
    const rows: OptionHeadcountRow[] = [];

    for (const household of households) {
        const raw = signups[household];
        const plan = migrateActivityPlan(raw, household, state);
        const familySize = getHouseholdSize(state, household);
        const effective = plan ?? {
            optionId: defaultOptionId,
            count: 0,
            confirmed: false,
        };

        const goingOption = effective.optionId;
        const goingCount = Math.min(Math.max(0, effective.count), familySize);
        const stay = findStayOption(activity);
        const remainder = familySize - goingCount;

        if (goingOption === optionId) {
            rows.push({
                household,
                count: goingCount,
                confirmed: effective.confirmed,
                assumed: !effective.confirmed,
            });
        } else if (remainder > 0 && stay?.id === optionId && goingOption !== stay.id) {
            rows.push({
                household,
                count: remainder,
                confirmed: effective.confirmed,
                assumed: !effective.confirmed,
            });
        }
    }

    return { total: rows.reduce((sum, r) => sum + r.count, 0), rows };
}

/** Confirmed households going to this activity (count > 0). */
export function confirmedAttendeesForActivity(
    _activity: SplittableActivity,
    signups: Record<string, HouseholdActivityPlan>,
    households: readonly string[],
    state: TripCollaborationState,
    currentHousehold?: string,
): ConfirmedAttendee[] {
    const attendees: ConfirmedAttendee[] = [];

    for (const household of households) {
        const plan = migrateActivityPlan(signups[household], household, state);
        if (!plan?.confirmed || plan.count <= 0) continue;

        attendees.push({
            household,
            count: Math.min(plan.count, getHouseholdSize(state, household)),
            initials: householdInitials(household),
            isYou: household === currentHousehold,
        });
    }

    return attendees.sort((a, b) => {
        if (a.isYou !== b.isYou) return a.isYou ? -1 : 1;
        return a.household.localeCompare(b.household);
    });
}

export function totalConfirmedHeadcount(attendees: ConfirmedAttendee[]): number {
    return attendees.reduce((sum, a) => sum + a.count, 0);
}

export function formatHeadcount(count: number): string {
    return count === 1 ? "1 person" : `${count} people`;
}
