import { TextArea } from "@/components/base/textarea/textarea";
import { DAYS } from "@/data/trip-content";
import { DayTag, EffortBox } from "@/components/trip/trip-ui";
import { useTrip } from "@/providers/trip-provider";

export function PlanPanel() {
    const { state, updateDayNotes } = useTrip();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-primary">The week at a glance</h2>
                <p className="mt-1 text-sm text-tertiary">
                    One marquee outing a day, pool time built in, and factual effort notes so everyone picks their own level. Day notes below
                    sync for all planners.
                </p>
            </div>

            {DAYS.map((day) => (
                <article key={day.id} className="overflow-hidden rounded-2xl border border-secondary bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                    <header className="flex items-center gap-3 border-b border-secondary bg-secondary px-4 py-3">
                        <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-solid text-xs font-bold text-white">
                            <span>{day.weekday}</span>
                            <span className="text-lg leading-none">{day.dayNum}</span>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-primary">
                                {day.title}
                                <DayTag label={day.tag} tone={day.tagTone} />
                            </h3>
                            <p className="text-sm font-medium text-brand-secondary">{day.theme}</p>
                        </div>
                    </header>
                    <div className="space-y-3 px-4 py-4">
                        {day.rows.map((row) => (
                            <div key={row.title} className="flex gap-3 text-sm">
                                <span className="text-lg leading-snug">{row.icon}</span>
                                <p>
                                    <b className="text-primary">{row.title}</b> {row.body}
                                </p>
                            </div>
                        ))}
                        <EffortBox>{day.effortAccess}</EffortBox>
                        <TextArea
                            label="Shared notes for this day"
                            hint="Timing tweaks, who's driving, outfit reminders — visible to all planners."
                            value={state.dayNotes[day.id] ?? ""}
                            onChange={(v) => updateDayNotes(day.id, v)}
                            rows={2}
                        />
                    </div>
                </article>
            ))}
        </div>
    );
}
