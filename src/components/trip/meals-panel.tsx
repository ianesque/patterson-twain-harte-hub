import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { DAYS, MEAL_LABELS, SUGGESTED_DINNERS } from "@/data/trip-content";
import { useTrip } from "@/providers/trip-provider";
import type { DayId, MealType } from "@/lib/types";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

export function MealsPanel() {
    const { state, updateMeal } = useTrip();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-primary">Meals &amp; cooking rotation</h2>
                <p className="mt-1 text-sm text-tertiary">
                    Assign who&apos;s cooking and what&apos;s on the menu. Updates appear for every planner in real time — perfect for
                    taking turns on dinner.
                </p>
            </div>

            {DAYS.map((day) => (
                <section key={day.id} className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                    <h3 className="font-semibold text-primary">
                        {day.weekday} {day.dayNum} · {day.title}
                    </h3>
                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        {MEALS.map((meal) => {
                            const slot = state.meals[day.id as DayId]?.[meal] ?? { menu: "" };
                            const suggested = meal === "dinner" ? SUGGESTED_DINNERS[day.id as DayId] : undefined;

                            return (
                                <div key={meal} className="rounded-xl border border-secondary bg-secondary p-3">
                                    <p className="text-sm font-semibold text-brand-secondary">{MEAL_LABELS[meal]}</p>
                                    {suggested && !slot.menu && (
                                        <p className="mt-1 text-xs text-quaternary">Idea: {suggested}</p>
                                    )}
                                    <div className="mt-3 space-y-2">
                                        <Input
                                            label="Cook / lead"
                                            size="sm"
                                            value={slot.cook ?? ""}
                                            onChange={(v) => updateMeal(day.id as DayId, meal, { cook: v, menu: slot.menu })}
                                            placeholder="Who's on duty?"
                                        />
                                        <Input
                                            label="Menu"
                                            size="sm"
                                            value={slot.menu}
                                            onChange={(v) => updateMeal(day.id as DayId, meal, { menu: v, cook: slot.cook })}
                                            placeholder={suggested ?? "What's for this meal?"}
                                        />
                                        <TextArea
                                            label="Notes"
                                            value={slot.notes ?? ""}
                                            onChange={(v) =>
                                                updateMeal(day.id as DayId, meal, {
                                                    notes: v,
                                                    menu: slot.menu,
                                                    cook: slot.cook,
                                                })
                                            }
                                            rows={2}
                                            placeholder="Dietary notes, timing, takeout vs cook"
                                        />
                                    </div>
                                    {slot.updatedBy && (
                                        <p className="mt-2 text-xs text-quaternary">
                                            Updated by {slot.updatedBy}
                                            {slot.updatedAt && ` · ${new Date(slot.updatedAt).toLocaleString()}`}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
