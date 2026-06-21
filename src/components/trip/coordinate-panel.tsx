import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { CHECKLIST, SPLITTABLE_ACTIVITIES } from "@/data/trip-content";
import { rsvpKey } from "@/lib/types";
import { useTrip } from "@/providers/trip-provider";
import type { RsvpStatus } from "@/lib/types";
import { cx } from "@/utils/cx";

const RSVP_OPTIONS: { value: RsvpStatus; label: string; color: "primary" | "secondary" | "tertiary" }[] = [
    { value: "in", label: "In", color: "primary" },
    { value: "maybe", label: "Maybe", color: "secondary" },
    { value: "out", label: "Out", color: "tertiary" },
];

const priorityClass = {
    now: "bg-utility-error-50 text-utility-error-700",
    soon: "bg-utility-warning-50 text-utility-warning-700",
    flex: "bg-secondary text-secondary",
};

export function CoordinatePanel() {
    const { state, memberName, setRsvp, toggleChecklist, resetChecklist } = useTrip();

    if (!memberName) return null;

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-primary">Activity sign-ups</h2>
                <p className="mt-1 text-sm text-tertiary">
                    Mark yourself in, maybe, or out on splittable outings. Everyone sees the headcount — no need to poll the group chat.
                </p>

                <div className="mt-4 space-y-4">
                    {SPLITTABLE_ACTIVITIES.map((activity) => {
                        const key = rsvpKey(activity.dayId, activity.id);
                        const votes = state.rsvps[key] ?? {};
                        const myVote = votes[memberName];

                        const counts = { in: 0, maybe: 0, out: 0 };
                        Object.values(votes).forEach((v) => {
                            counts[v]++;
                        });

                        return (
                            <article
                                key={activity.id}
                                className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset"
                            >
                                <h3 className="font-semibold text-primary">{activity.title}</h3>
                                <p className="mt-1 text-sm text-tertiary">{activity.description}</p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {RSVP_OPTIONS.map((opt) => (
                                        <Button
                                            key={opt.value}
                                            size="sm"
                                            color={myVote === opt.value ? "primary" : opt.color}
                                            onClick={() => setRsvp(key, memberName, opt.value)}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </div>

                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {activity.options.map((option) => (
                                        <div key={option.id} className="rounded-lg bg-secondary px-3 py-2 text-sm">
                                                <p className="font-medium text-primary">{option.label}</p>
                                                <p className="text-xs text-tertiary">{option.description}</p>
                                            </div>
                                    ))}
                                </div>

                                <p className="mt-3 text-xs text-quaternary">
                                    Headcount: {counts.in} in · {counts.maybe} maybe · {counts.out} out
                                </p>

                                {Object.keys(votes).length > 0 && (
                                    <ul className="mt-2 space-y-1 text-xs text-secondary">
                                        {Object.entries(votes).map(([name, status]) => (
                                            <li key={name}>
                                                <span className="font-medium">{name}</span> — {status}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-primary">Reservations checklist</h2>
                        <p className="mt-1 text-sm text-tertiary">Shared across all planners — checkoffs sync live.</p>
                    </div>
                    <Button color="secondary" size="sm" onClick={resetChecklist}>
                        Reset checklist
                    </Button>
                </div>

                <ul className="mt-4 space-y-2">
                    {CHECKLIST.map((item) => {
                        const checked = state.checklist[item.key]?.done ?? false;
                        const meta = state.checklist[item.key];
                        return (
                            <li
                                key={item.key}
                                className={cx(
                                    "flex gap-3 rounded-xl border border-secondary bg-primary p-3 shadow-xs ring-1 ring-secondary ring-inset",
                                    checked && "opacity-60",
                                )}
                            >
                                <Checkbox isSelected={checked} onChange={() => toggleChecklist(item.key)} aria-label={item.title} />
                                <div className="min-w-0 flex-1">
                                    <p className={cx("font-semibold text-primary", checked && "line-through")}>
                                        {item.title}
                                        <span
                                            className={cx(
                                                "ml-2 inline-flex rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase",
                                                priorityClass[item.priority],
                                            )}
                                        >
                                            {item.priority === "now" ? "Do now" : item.priority === "soon" ? "Soon" : "Flexible"}
                                        </span>
                                    </p>
                                    <p className="text-sm text-tertiary">{item.detail}</p>
                                    {item.phone && <p className="mt-1 text-sm font-semibold text-brand-secondary">{item.phone}</p>}
                                    {meta?.doneBy && checked && (
                                        <p className="mt-1 text-xs text-quaternary">Checked by {meta.doneBy}</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}
