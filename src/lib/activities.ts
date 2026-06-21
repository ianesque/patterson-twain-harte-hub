import { DAYS, RSVP_ACTIVITIES, type SplittableActivity } from "@/data/trip-content";
import {
    rsvpKey,
    type ActivityOverride,
    type CustomActivity,
    type DayId,
    type TripCollaborationState,
} from "@/lib/types";

/** Days that appear on Coordinate → Who's going (Wed–Sat). */
export const RSVP_DAY_IDS: DayId[] = ["wed-24", "thu-25", "fri-26", "sat-27"];

export interface CoordinateActivity extends SplittableActivity {
    isCustom: boolean;
}

export function rsvpDayOptions() {
    return RSVP_DAY_IDS.map((id) => {
        const day = DAYS.find((d) => d.id === id);
        const label = day ? `${day.weekday.charAt(0) + day.weekday.slice(1).toLowerCase()} ${day.dayNum}` : id;
        return { value: id, label };
    });
}

export function applyActivityOverride(
    activity: SplittableActivity,
    overrides: Record<string, ActivityOverride> | undefined,
): SplittableActivity {
    const key = rsvpKey(activity.dayId, activity.id);
    const override = overrides?.[key];
    if (!override) return activity;

    return {
        ...activity,
        title: override.title?.trim() ? override.title : activity.title,
        description: override.description !== undefined ? override.description : activity.description,
        emoji: override.emoji?.trim() ? override.emoji : activity.emoji,
    };
}

export function customToSplittable(custom: CustomActivity): SplittableActivity {
    return {
        id: custom.id,
        dayId: custom.dayId,
        title: custom.title,
        description: custom.description ?? "",
        emoji: custom.emoji?.trim() || "📌",
        defaultOptionId: custom.id,
        options: [
            {
                id: custom.id,
                label: custom.title,
                description: custom.description ?? "",
            },
        ],
    };
}

export function getCoordinateActivities(state: TripCollaborationState): CoordinateActivity[] {
    const builtIn = RSVP_ACTIVITIES.filter((activity) => RSVP_DAY_IDS.includes(activity.dayId)).map((activity) => ({
        ...applyActivityOverride(activity, state.activityOverrides),
        isCustom: false,
    }));

    const custom = (state.customActivities ?? [])
        .filter((activity) => RSVP_DAY_IDS.includes(activity.dayId) && activity.title.trim())
        .map((activity) => ({
            ...customToSplittable(activity),
            isCustom: true,
        }));

    return [...builtIn, ...custom];
}

function pruneActivityOverrides(overrides: Record<string, ActivityOverride>): Record<string, ActivityOverride> {
    const next: Record<string, ActivityOverride> = {};
    for (const [key, override] of Object.entries(overrides)) {
        const cleaned: ActivityOverride = {};
        if (override.title?.trim()) cleaned.title = override.title.trim();
        if (override.description !== undefined) cleaned.description = override.description;
        if (override.emoji?.trim()) cleaned.emoji = override.emoji.trim();
        if (Object.keys(cleaned).length > 0) next[key] = cleaned;
    }
    return next;
}

export function normalizeCollaborationState(state: TripCollaborationState): TripCollaborationState {
    const customActivities = (state.customActivities ?? [])
        .filter((activity) => activity.id && activity.title?.trim() && RSVP_DAY_IDS.includes(activity.dayId))
        .map((activity) => ({
            ...activity,
            title: activity.title.trim(),
            description: activity.description?.trim() || undefined,
            emoji: activity.emoji?.trim() || undefined,
        }));

    return {
        ...state,
        customActivities,
        activityOverrides: pruneActivityOverrides(state.activityOverrides ?? {}),
    };
}

export function newCustomActivityId(): string {
    return `custom-${crypto.randomUUID().slice(0, 8)}`;
}
