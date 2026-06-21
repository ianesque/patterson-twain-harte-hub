import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { DINNER_DAYS, MEALS_NOTE, SUGGESTED_DINNERS } from "@/data/trip-content";
import { DayHeader, getTripDayHighlight, PanelHeader } from "@/components/trip/trip-ui";
import { useTrip } from "@/providers/trip-provider";
import type { DayId } from "@/lib/types";
import { cx } from "@/utils/cx";

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
                    <section
                        key={day.id}
                        className={cx("trip-card p-4 sm:p-5", (highlight === "today" || highlight === "upcoming") && "ring-2 ring-brand-300/60")}
                    >
                        <DayHeader
                            weekday={day.weekday}
                            dayNum={day.dayNum}
                            title="Dinner"
                            highlight={highlight || undefined}
                        />

                        {suggested && !slot.menu && !slot.cook && (
                            <p className="mt-3 text-xs leading-relaxed text-quaternary">Suggestion: {suggested}</p>
                        )}

                        <div className="mt-4 space-y-2">
                            <Input
                                label="Cook"
                                size="sm"
                                value={slot.cook ?? ""}
                                onChange={(v) => updateMeal(day.id as DayId, "dinner", { cook: v, menu: slot.menu })}
                                placeholder="Who's cooking"
                            />
                            <Input
                                label="Menu"
                                size="sm"
                                value={slot.menu}
                                onChange={(v) => updateMeal(day.id as DayId, "dinner", { menu: v, cook: slot.cook })}
                                placeholder="What we're having"
                            />
                            <TextArea
                                label="Notes"
                                value={slot.notes ?? ""}
                                onChange={(v) =>
                                    updateMeal(day.id as DayId, "dinner", {
                                        notes: v,
                                        menu: slot.menu,
                                        cook: slot.cook,
                                    })
                                }
                                rows={2}
                                placeholder="Optional"
                            />
                        </div>
                        {slot.updatedBy && (
                            <p className="mt-2 text-xs text-quaternary">
                                {slot.updatedBy}
                                {slot.updatedAt &&
                                    ` · ${new Date(slot.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                            </p>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
