import { TextArea } from "@/components/base/textarea/textarea";
import { DAYS, TRIP_META } from "@/data/trip-content";
import { DayHeader, EffortBox, getTripDayHighlight, PanelHeader } from "@/components/trip/trip-ui";
import { useTrip } from "@/providers/trip-provider";
import { cx } from "@/utils/cx";

export function PlanPanel() {
    const { state, updateDayNotes } = useTrip();

    return (
        <div className="space-y-6">
            <PanelHeader title="This week" description="One main outing per day. Add notes everyone can see." />

            <p className="trip-callout">
                Check-in Tue 4 PM ·{" "}
                <a href={TRIP_META.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--trip-accent)]">
                    {TRIP_META.address}
                </a>
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {DAYS.map((day) => (
                    <a
                        key={day.id}
                        href={`#day-${day.id}`}
                        className="inline-flex shrink-0 flex-col items-center rounded-2xl border border-[var(--trip-separator)] bg-primary px-4 py-2.5 text-center shadow-xs transition-colors active:bg-secondary"
                    >
                        <span className="text-[var(--trip-caption)] font-bold uppercase text-tertiary">{day.weekday}</span>
                        <span className="text-[1.375rem] font-bold leading-none tracking-tight text-primary">{day.dayNum}</span>
                    </a>
                ))}
            </div>

            {DAYS.map((day) => {
                const highlight = getTripDayHighlight(day.id);

                return (
                    <article
                        key={day.id}
                        id={`day-${day.id}`}
                        className={cx(
                            "trip-card scroll-mt-28 overflow-hidden",
                            (highlight === "today" || highlight === "upcoming") && "ring-2 ring-[var(--trip-accent)]/40",
                        )}
                    >
                        <header className="border-b border-[var(--trip-separator)] bg-secondary px-4 py-4 sm:px-5">
                            <DayHeader
                                weekday={day.weekday}
                                dayNum={day.dayNum}
                                title={day.title}
                                theme={day.theme}
                                tag={day.tag}
                                tagTone={day.tagTone}
                                highlight={highlight || undefined}
                            />
                        </header>
                        <div className="space-y-3 px-4 py-4">
                            {day.rows.map((row) => (
                                <div key={row.title} className="flex gap-3.5 text-[var(--trip-body-sm)] leading-relaxed sm:text-[var(--trip-body)]">
                                    <span className="mt-0.5 text-[1.375rem] leading-none" aria-hidden>
                                        {row.icon}
                                    </span>
                                    <p>
                                        <span className="font-semibold text-primary">{row.title}</span> {row.body}
                                    </p>
                                </div>
                            ))}
                            <EffortBox>{day.effortAccess}</EffortBox>
                            <TextArea
                                label="Notes"
                                value={state.dayNotes[day.id] ?? ""}
                                onChange={(v) => updateDayNotes(day.id, v)}
                                rows={2}
                                placeholder="Optional"
                            />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
