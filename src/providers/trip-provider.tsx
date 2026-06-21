import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getStoredMember } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
    emptyCollaborationState,
    TRIP_STATE_ID,
    type ChecklistItem,
    type DayId,
    type MealSlot,
    type MealType,
    type RsvpStatus,
    type TripCollaborationState,
} from "@/lib/types";

type SyncStatus = "loading" | "connected" | "offline" | "error";

interface TripContextValue {
    state: TripCollaborationState;
    syncStatus: SyncStatus;
    lastUpdatedBy: string | null;
    lastUpdatedAt: string | null;
    memberName: string | null;
    setMemberName: (name: string) => void;
    updateMeal: (dayId: DayId, meal: MealType, patch: Partial<MealSlot>) => void;
    updateDayNotes: (dayId: DayId, notes: string) => void;
    setRsvp: (key: string, member: string, status: RsvpStatus) => void;
    setActivitySignup: (key: string, member: string, optionId: string | null) => void;
    setActivityChoice: (dayId: DayId, optionId: string, notes?: string) => void;
    toggleChecklist: (key: string) => void;
    resetChecklist: () => void;
}

const TripContext = createContext<TripContextValue | null>(null);

const LOCAL_KEY = "twain_harte_collab_v1";

function normalizeState(payload: Partial<TripCollaborationState> | null | undefined): TripCollaborationState {
    return { ...emptyCollaborationState(), ...payload };
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
    const pendingWrite = useRef(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        };
    }, [applyRemote]);

    const mutate = useCallback(
        (updater: (prev: TripCollaborationState) => TripCollaborationState) => {
            setState((prev) => {
                const next = updater(prev);
                persist(next, memberName);
                return next;
            });
        },
        [memberName, persist],
    );

    const setMemberName = useCallback((name: string) => {
        setMemberNameState(name);
        localStorage.setItem("twain_harte_member", name);
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
                    current[member] = optionId;
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

    const value = useMemo(
        () => ({
            state,
            syncStatus,
            lastUpdatedBy,
            lastUpdatedAt,
            memberName,
            setMemberName,
            updateMeal,
            updateDayNotes,
            setRsvp,
            setActivitySignup,
            setActivityChoice,
            toggleChecklist,
            resetChecklist,
        }),
        [
            state,
            syncStatus,
            lastUpdatedBy,
            lastUpdatedAt,
            memberName,
            setMemberName,
            updateMeal,
            updateDayNotes,
            setRsvp,
            setActivitySignup,
            setActivityChoice,
            toggleChecklist,
            resetChecklist,
        ],
    );

    return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
    const ctx = useContext(TripContext);
    if (!ctx) throw new Error("useTrip must be used within TripProvider");
    return ctx;
}
