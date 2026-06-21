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

export interface TripCollaborationState {
    meals: Partial<Record<DayId, Partial<Record<MealType, MealSlot>>>>;
    activityChoices: Partial<Record<DayId, { optionId: string; notes?: string }>>;
    /** rsvpKey → household → option id from SPLITTABLE_ACTIVITIES */
    activitySignups: Record<string, Record<string, string>>;
    rsvps: Record<string, Record<string, RsvpStatus>>;
    checklist: Record<string, ChecklistItem>;
    dayNotes: Partial<Record<DayId, string>>;
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
];

export function emptyCollaborationState(): TripCollaborationState {
    return {
        meals: {},
        activityChoices: {},
        activitySignups: {},
        rsvps: {},
        checklist: {},
        dayNotes: {},
    };
}

export function rsvpKey(dayId: DayId, activityId: string): string {
    return `${dayId}:${activityId}`;
}
