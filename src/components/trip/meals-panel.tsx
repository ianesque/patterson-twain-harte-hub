import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { DINNER_DAYS, MEALS_NOTE, SUGGESTED_DINNERS } from "@/data/trip-content";
import { DayHeader, getTripDayHighlight, PanelHeader } from "@/components/trip/trip-ui";
import { useTrip } from "@/providers/trip-provider";
import type { DayId } from "@/lib/types";
import { cx } from "@/utils/cx";

function mealSummary(slot: { cook?: string; menu: string; notes?: string }) {
    if (slot.cook && slot.menu) return `${slot.cook} · ${slot.menu}`;
    if (slot.cook) return slot.cook;
    if (slot.menu) return slot.menu;
    return "Tap to add dinner details";
}

function MealDayCard({
    weekday,
    dayNum,
    highlight,
    slot,
    suggested,
    onUpdate,
}: {
    weekday: string;
    dayNum: string;
    highlight: ReturnType<typeof getTripDayHighlight>;
    slot: { cook?: string; menu: string; notes?: string; updatedBy?: string; updatedAt?: string };
    suggested?: string;
    onUpdate: (patch: Partial<{ cook: string; menu: string; notes: string }>) => void;
}) {
    const hasContent = Boolean(slot.cook || slot.menu || slot.notes);
    const [expanded, setExpanded] = useState(!hasContent);
    const prevFilled = useRef({ cook: slot.cook, menu: slot.menu });

    useEffect(() => {
        const wasIncomplete = !prevFilled.current.cook || !prevFilled.current.menu;
        const nowComplete = Boolean(slot.cook && slot.menu);
        if (wasIncomplete && nowComplete) setExpanded(false);
        prevFilled.current = { cook: slot.cook, menu: slot.menu };
    }, [slot.cook, slot.menu]);

    return (
        <section
            className={cx("trip-card p-4 sm:p-5", (highlight === "today" || highlight === "upcoming") && "ring-2 ring-[var(--trip-accent)]/40")}
        >
            <DayHeader weekday={weekday} dayNum={dayNum} title="Dinner" highlight={highlight || undefined} />

            {!expanded && hasContent ? (
                <button type="button" className="trip-meal-summary mt-4" onClick={() => setExpanded(true)}>
                    <span className="text-[var(--trip-body-sm)] font-medium text-primary">{mealSummary(slot)}</span>
                    <ChevronDown className="size-5 shrink-0 text-tertiary" aria-hidden />
                </button>
            ) : (
                <div className="mt-4 space-y-2">
                    {suggested && !slot.menu && !slot.cook && (
                        <button
                            type="button"
                            className="trip-suggestion-chip"
                            onClick={() => onUpdate({ menu: suggested, cook: slot.cook ?? "" })}
                        >
                            Use suggestion: {suggested}
                        </button>
                    )}
                    <Input
                        label="Cook"
                        size="sm"
                        value={slot.cook ?? ""}
                        onChange={(v) => onUpdate({ cook: v, menu: slot.menu })}
                        placeholder="Who's cooking"
                    />
                    <Input
                        label="Menu"
                        size="sm"
                        value={slot.menu}
                        onChange={(v) => onUpdate({ menu: v, cook: slot.cook })}
                        placeholder="What we're having"
                    />
                    <TextArea
                        label="Notes"
                        value={slot.notes ?? ""}
                        onChange={(v) => onUpdate({ notes: v, menu: slot.menu, cook: slot.cook })}
                        rows={2}
                        placeholder="Optional"
                    />
                </div>
            )}

            {slot.updatedBy && (
                <p className="mt-2 text-xs text-quaternary">
                    {slot.updatedBy}
                    {slot.updatedAt && ` · ${new Date(slot.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                </p>
            )}
        </section>
    );
}

export function MealsPanel() {
    const { state, updateMeal } = useTrip();

    return (
        <div className="space-y-6">
            <PanelHeader title="Meals" description="Who's cooking each night." />

            <p className="trip-callout">{MEALS_NOTE}</p>

            {DINNER_DAYS.map((day) => {
                const highlight = getTripDayHighlight(day.id);
                const slot = state.meals[day.id as DayId]?.dinner ?? { menu: "" };
                const suggested = SUGGESTED_DINNERS[day.id as DayId];

                return (
                    <MealDayCard
                        key={day.id}
                        weekday={day.weekday}
                        dayNum={day.dayNum}
                        highlight={highlight}
                        slot={slot}
                        suggested={suggested}
                        onUpdate={(patch) =>
                            updateMeal(day.id as DayId, "dinner", {
                                cook: patch.cook ?? slot.cook,
                                menu: patch.menu ?? slot.menu,
                                notes: patch.notes ?? slot.notes,
                            })
                        }
                    />
                );
            })}
        </div>
    );
}
