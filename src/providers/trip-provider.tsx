import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clearStoredMember, getStoredMember } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
    emptyCollaborationState,
    TRIP_STATE_ID,
    rsvpKey,
    type ActivityOverride,
    type ChecklistItem,
    type CustomActivity,
    type DayId,
    type HouseholdActivityPlan,
    type MealSlot,
    type MealType,
    type RsvpStatus,
    type TripCollaborationState,
} from "@/lib/types";
import { newCustomActivityId } from "@/lib/activities";
import { normalizeActivitySignups } from "@/lib/activity-signups";

type SyncStatus = "loading" | "connected" | "offline" | "error";

interface TripContextValue {
    state: TripCollaborationState;
    syncStatus: SyncStatus;
    lastUpdatedBy: string | null;
    lastUpdatedAt: string | null;
    savedFlash: boolean;
    memberName: string | null;
    setMemberName: (name: string) => void;
    clearMember: () => void;
    updateMeal: (dayId: DayId, meal: MealType, patch: Partial<MealSlot>) => void;
    updateDayNotes: (dayId: DayId, notes: string) => void;
    setRsvp: (key: string, member: string, status: RsvpStatus) => void;
    setActivitySignup: (key: string, member: string, optionId: string | null) => void;
    setActivityPlan: (key: string, household: string, plan: HouseholdActivityPlan | null) => void;
    setHouseholdSize: (household: string, size: number) => void;
    setActivityChoice: (dayId: DayId, optionId: string, notes?: string) => void;
    toggleChecklist: (key: string) => void;
    resetChecklist: () => void;
    addCustomActivity: (activity: Omit<CustomActivity, "id" | "createdAt" | "createdBy">) => string;
    updateCustomActivity: (id: string, patch: Partial<Pick<CustomActivity, "dayId" | "title" | "description" | "emoji">>) => void;
    deleteCustomActivity: (id: string) => void;
    setActivityOverride: (key: string, patch: ActivityOverride | null) => void;
    setRoomAssignment: (roomId: string, household: string | null) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

const LOCAL_KEY = "twain_harte_collab_v1";

function normalizeState(payload: Partial<TripCollaborationState> | null | undefined): TripCollaborationState {
    return normalizeActivitySignups({ ...emptyCollaborationState(), ...payload });
}

function loadLocalState(): TripCollaborationState {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) return normalizeState(JSON.parse(raw) as TripCollaborationState);
    } catch {
        /* ignore */
    }
    return emptyCollaborationState();
}

function saveLocalState(state: TripCollaborationState) {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch {
        /* ignore */
    }
}

export function TripProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TripCollaborationState>(loadLocalState);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
    const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [memberName, setMemberNameState] = useState<string | null>(() => getStoredMember());
    const [savedFlash, setSavedFlash] = useState(false);
    const pendingWrite = useRef(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const persist = useCallback(
        (next: TripCollaborationState, updatedBy: string | null) => {
            saveLocalState(next);

            if (!isSupabaseConfigured || !supabase) {
                setSyncStatus("offline");
                return;
            }

            pendingWrite.current = true;
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(async () => {
                const { error } = await supabase!.from("trip_state").upsert({
                    id: TRIP_STATE_ID,
                    payload: next,
                    updated_by: updatedBy,
                    updated_at: new Date().toISOString(),
                });

                pendingWrite.current = false;
                if (error) {
                    setSyncStatus("error");
                    console.error("Supabase sync error:", error);
                } else {
                    setSyncStatus("connected");
                }
            }, 500);
        },
        [],
    );

    const applyRemote = useCallback((payload: TripCollaborationState, updatedBy: string | null, updatedAt: string) => {
        if (pendingWrite.current) return;
        const merged = normalizeState(payload);
        setState(merged);
        saveLocalState(merged);
        setLastUpdatedBy(updatedBy);
        setLastUpdatedAt(updatedAt);
    }, []);

    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) {
            setSyncStatus("offline");
            return;
        }

        let cancelled = false;
        const client = supabase;

        // Register listeners before subscribe — must be synchronous (StrictMode-safe).
        const channel = client
            .channel(`trip-state:${TRIP_STATE_ID}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "trip_state", filter: `id=eq.${TRIP_STATE_ID}` },
                (payload) => {
                    if (cancelled) return;
                    const row = payload.new as {
                        payload: TripCollaborationState;
                        updated_by: string | null;
                        updated_at: string;
                    };
                    if (row?.payload) {
                        applyRemote(row.payload, row.updated_by, row.updated_at);
                    }
                },
            )
            .subscribe((status) => {
                if (cancelled) return;
                if (status === "SUBSCRIBED") setSyncStatus("connected");
                if (status === "CHANNEL_ERROR") setSyncStatus("error");
            });

        void (async () => {
            const { data, error } = await client.from("trip_state").select("*").eq("id", TRIP_STATE_ID).maybeSingle();
            if (cancelled) return;

            if (error) {
                setSyncStatus("error");
                console.error(error);
                return;
            }

            if (data?.payload && Object.keys(data.payload).length > 0) {
                applyRemote(data.payload as TripCollaborationState, data.updated_by, data.updated_at);
            }
        })();

        return () => {
            cancelled = true;
            void client.removeChannel(channel);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (savedFlashRef.current) clearTimeout(savedFlashRef.current);
        };
    }, [applyRemote]);

    const flashSaved = useCallback(() => {
        setSavedFlash(true);
        if (savedFlashRef.current) clearTimeout(savedFlashRef.current);
        savedFlashRef.current = setTimeout(() => setSavedFlash(false), 2500);
    }, []);

    const mutate = useCallback(
        (updater: (prev: TripCollaborationState) => TripCollaborationState) => {
            setState((prev) => {
                const next = updater(prev);
                persist(next, memberName);
                if (memberName) flashSaved();
                return next;
            });
        },
        [memberName, persist, flashSaved],
    );

    const setMemberName = useCallback((name: string) => {
        setMemberNameState(name);
        localStorage.setItem("twain_harte_member", name);
    }, []);

    const clearMember = useCallback(() => {
        setMemberNameState(null);
        clearStoredMember();
    }, []);

    const updateMeal = useCallback(
        (dayId: DayId, meal: MealType, patch: Partial<MealSlot>) => {
            mutate((prev) => {
                const dayMeals = { ...(prev.meals[dayId] ?? {}) };
                const current = dayMeals[meal] ?? { menu: "" };
                dayMeals[meal] = {
                    ...current,
                    ...patch,
                    updatedBy: memberName ?? undefined,
                    updatedAt: new Date().toISOString(),
                };
                return { ...prev, meals: { ...prev.meals, [dayId]: dayMeals } };
            });
        },
        [memberName, mutate],
    );

    const updateDayNotes = useCallback(
        (dayId: DayId, notes: string) => {
            mutate((prev) => ({ ...prev, dayNotes: { ...prev.dayNotes, [dayId]: notes } }));
        },
        [mutate],
    );

    const setRsvp = useCallback(
        (key: string, member: string, status: RsvpStatus) => {
            mutate((prev) => ({
                ...prev,
                rsvps: {
                    ...prev.rsvps,
                    [key]: { ...(prev.rsvps[key] ?? {}), [member]: status },
                },
            }));
        },
        [mutate],
    );

    const setActivitySignup = useCallback(
        (key: string, member: string, optionId: string | null) => {
            mutate((prev) => {
                const current = { ...(prev.activitySignups[key] ?? {}) };
                if (optionId) {
                    current[member] = { optionId, count: 0, confirmed: true };
                } else {
                    delete current[member];
                }
                return {
                    ...prev,
                    activitySignups: {
                        ...prev.activitySignups,
                        [key]: current,
                    },
                };
            });
        },
        [mutate],
    );

    const setActivityPlan = useCallback(
        (key: string, household: string, plan: HouseholdActivityPlan | null) => {
            mutate((prev) => {
                const current = { ...(prev.activitySignups[key] ?? {}) };
                if (plan) {
                    current[household] = plan;
                } else {
                    delete current[household];
                }
                return {
                    ...prev,
                    activitySignups: {
                        ...prev.activitySignups,
                        [key]: current,
                    },
                };
            });
        },
        [mutate],
    );

    const setHouseholdSize = useCallback(
        (household: string, size: number) => {
            const clamped = Math.min(12, Math.max(1, size));
            mutate((prev) => ({
                ...prev,
                householdSizes: { ...prev.householdSizes, [household]: clamped },
            }));
        },
        [mutate],
    );

    const setActivityChoice = useCallback(
        (dayId: DayId, optionId: string, notes?: string) => {
            mutate((prev) => ({
                ...prev,
                activityChoices: { ...prev.activityChoices, [dayId]: { optionId, notes } },
            }));
        },
        [mutate],
    );

    const toggleChecklist = useCallback(
        (key: string) => {
            mutate((prev) => {
                const current: ChecklistItem = prev.checklist[key] ?? { done: false };
                const done = !current.done;
                return {
                    ...prev,
                    checklist: {
                        ...prev.checklist,
                        [key]: {
                            done,
                            doneBy: done ? (memberName ?? undefined) : undefined,
                            doneAt: done ? new Date().toISOString() : undefined,
                        },
                    },
                };
            });
        },
        [memberName, mutate],
    );

    const resetChecklist = useCallback(() => {
        mutate((prev) => ({ ...prev, checklist: {} }));
    }, [mutate]);

    const addCustomActivity = useCallback(
        (activity: Omit<CustomActivity, "id" | "createdAt" | "createdBy">) => {
            const id = newCustomActivityId();
            mutate((prev) => ({
                ...prev,
                customActivities: [
                    ...(prev.customActivities ?? []),
                    {
                        ...activity,
                        id,
                        title: activity.title.trim(),
                        description: activity.description?.trim() || undefined,
                        emoji: activity.emoji?.trim() || undefined,
                        createdBy: memberName ?? undefined,
                        createdAt: new Date().toISOString(),
                    },
                ],
            }));
            return id;
        },
        [memberName, mutate],
    );

    const updateCustomActivity = useCallback(
        (id: string, patch: Partial<Pick<CustomActivity, "dayId" | "title" | "description" | "emoji">>) => {
            mutate((prev) => {
                const existing = (prev.customActivities ?? []).find((activity) => activity.id === id);
                if (!existing) return prev;

                const nextActivity: CustomActivity = {
                    ...existing,
                    ...patch,
                    title: patch.title !== undefined ? patch.title.trim() : existing.title,
                    description:
                        patch.description !== undefined ? patch.description.trim() || undefined : existing.description,
                    emoji: patch.emoji !== undefined ? patch.emoji.trim() || undefined : existing.emoji,
                };

                const oldKey = rsvpKey(existing.dayId, id);
                const newKey = rsvpKey(nextActivity.dayId, id);
                const nextSignups = { ...prev.activitySignups };

                if (oldKey !== newKey && nextSignups[oldKey]) {
                    nextSignups[newKey] = { ...(nextSignups[newKey] ?? {}), ...nextSignups[oldKey] };
                    delete nextSignups[oldKey];
                }

                return {
                    ...prev,
                    activitySignups: nextSignups,
                    customActivities: (prev.customActivities ?? []).map((activity) =>
                        activity.id === id ? nextActivity : activity,
                    ),
                };
            });
        },
        [mutate],
    );

    const deleteCustomActivity = useCallback(
        (id: string) => {
            mutate((prev) => {
                const existing = (prev.customActivities ?? []).find((activity) => activity.id === id);
                if (!existing) return prev;

                const key = rsvpKey(existing.dayId, id);
                const nextSignups = { ...prev.activitySignups };
                delete nextSignups[key];

                return {
                    ...prev,
                    activitySignups: nextSignups,
                    customActivities: (prev.customActivities ?? []).filter((activity) => activity.id !== id),
                };
            });
        },
        [mutate],
    );

    const setActivityOverride = useCallback(
        (key: string, patch: ActivityOverride | null) => {
            mutate((prev) => {
                const current = { ...(prev.activityOverrides ?? {}) };
                if (!patch) {
                    delete current[key];
                } else {
                    const cleaned: ActivityOverride = {};
                    if (patch.title?.trim()) cleaned.title = patch.title.trim();
                    if (patch.description !== undefined) cleaned.description = patch.description;
                    if (patch.emoji?.trim()) cleaned.emoji = patch.emoji.trim();

                    if (Object.keys(cleaned).length === 0) {
                        delete current[key];
                    } else {
                        current[key] = cleaned;
                    }
                }

                return { ...prev, activityOverrides: current };
            });
        },
        [mutate],
    );

    const setRoomAssignment = useCallback(
        (roomId: string, household: string | null) => {
            mutate((prev) => {
                const current = { ...(prev.roomAssignments ?? {}) };
                if (household) {
                    current[roomId] = household;
                } else {
                    delete current[roomId];
                }
                return { ...prev, roomAssignments: current };
            });
        },
        [mutate],
    );

    const value = useMemo(
        () => ({
            state,
            syncStatus,
            lastUpdatedBy,
            lastUpdatedAt,
            savedFlash,
            memberName,
            setMemberName,
            clearMember,
            updateMeal,
            updateDayNotes,
            setRsvp,
            setActivitySignup,
            setActivityPlan,
            setHouseholdSize,
            setActivityChoice,
            toggleChecklist,
            resetChecklist,
            addCustomActivity,
            updateCustomActivity,
            deleteCustomActivity,
            setActivityOverride,
            setRoomAssignment,
        }),
        [
            state,
            syncStatus,
            lastUpdatedBy,
            lastUpdatedAt,
            savedFlash,
            memberName,
            setMemberName,
            clearMember,
            updateMeal,
            updateDayNotes,
            setRsvp,
            setActivitySignup,
            setActivityPlan,
            setHouseholdSize,
            setActivityChoice,
            toggleChecklist,
            resetChecklist,
            addCustomActivity,
            updateCustomActivity,
            deleteCustomActivity,
            setActivityOverride,
            setRoomAssignment,
        ],
    );

    return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
    const ctx = useContext(TripContext);
    if (!ctx) throw new Error("useTrip must be used within TripProvider");
    return ctx;
}
