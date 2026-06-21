export type DayId = "tue-23" | "wed-24" | "thu-25" | "fri-26" | "sat-27";
export type MealType = "breakfast" | "lunch" | "dinner";
export type RsvpStatus = "in" | "maybe" | "out";

export interface MealSlot {
    cook?: string;
    menu: string;
    notes?: string;
    updatedBy?: string;
    updatedAt?: string;
}

export interface ChecklistItem {
    done: boolean;
    doneBy?: string;
    doneAt?: string;
}

export interface HouseholdActivityPlan {
    optionId: string;
    count: number;
    confirmed: boolean;
}

export interface CustomActivity {
    id: string;
    dayId: DayId;
    title: string;
    description?: string;
    emoji?: string;
    createdBy?: string;
    createdAt?: string;
}

export interface ActivityOverride {
    title?: string;
    description?: string;
    emoji?: string;
}

export interface TripCollaborationState {
    meals: Partial<Record<DayId, Partial<Record<MealType, MealSlot>>>>;
    activityChoices: Partial<Record<DayId, { optionId: string; notes?: string }>>;
    /** rsvpKey → household → plan for that outing */
    activitySignups: Record<string, Record<string, HouseholdActivityPlan>>;
    /** household → default group size for headcounts */
    householdSizes: Record<string, number>;
    rsvps: Record<string, Record<string, RsvpStatus>>;
    checklist: Record<string, ChecklistItem>;
    dayNotes: Partial<Record<DayId, string>>;
    /** User-added outings visible on Coordinate → Who's going */
    customActivities: CustomActivity[];
    /** rsvpKey → display overrides for built-in activities */
    activityOverrides: Record<string, ActivityOverride>;
    /** household/member name → avatar id */
    memberAvatars: Record<string, string>;
    /** roomId → household that claimed a TBD room */
    roomAssignments: Record<string, string>;
}

export interface TripStateRow {
    id: string;
    payload: TripCollaborationState;
    updated_at: string;
    updated_by: string | null;
}

export const TRIP_STATE_ID = "twain-harte-2026";

export const DEFAULT_PLANNER_SUGGESTIONS = [
    "Ian & Kimberly",
    "Ben & Stephanie",
    "Darren & Alicia",
    "Gabe",
    "Dick, Jan & Ryan",
] as const;

/** Fixed headcounts per household — used to cap activity signups. */
export const DEFAULT_HOUSEHOLD_SIZES: Record<string, number> = {
    "Ian & Kimberly": 5,
    "Ben & Stephanie": 6,
    "Darren & Alicia": 5,
    Gabe: 1,
    "Dick, Jan & Ryan": 3,
};

export function emptyCollaborationState(): TripCollaborationState {
    return {
        meals: {},
        activityChoices: {},
        activitySignups: {},
        householdSizes: {},
        rsvps: {},
        checklist: {},
        dayNotes: {},
        customActivities: [],
        activityOverrides: {},
        memberAvatars: {},
        roomAssignments: {},
    };
}

export function rsvpKey(dayId: DayId, activityId: string): string {
    return `${dayId}:${activityId}`;
}
