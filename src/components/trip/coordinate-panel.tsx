import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { CHECKLIST, dayShortLabel, SPLITTABLE_ACTIVITIES } from "@/data/trip-content";
import { DEFAULT_PLANNER_SUGGESTIONS, rsvpKey } from "@/lib/types";
import { useTrip } from "@/providers/trip-provider";
import type { ChecklistDef, SplittableActivity } from "@/data/trip-content";
import { ChecklistProgress, PanelHeader, PhoneLine } from "@/components/trip/trip-ui";
import { cx } from "@/utils/cx";

const COORDINATE_TAB_KEY = "twain_harte_coordinate_tab";

const CHECKLIST_GROUPS: { id: ChecklistDef["priority"]; label: string; urgent?: boolean }[] = [
    { id: "now", label: "Do first", urgent: true },
    { id: "soon", label: "Before the trip", urgent: false },
    { id: "flex", label: "When you can", urgent: false },
];

const COORDINATE_SUBTABS = [
    { id: "actions", label: "Actions needed" },
    { id: "plans", label: "Your plans" },
] as const;

type CoordinateSubTab = (typeof COORDINATE_SUBTABS)[number]["id"];

function readCoordinateSubTab(): CoordinateSubTab {
    const stored = sessionStorage.getItem(COORDINATE_TAB_KEY);
    return stored === "plans" ? "plans" : "actions";
}

function resolvePick(signups: Record<string, string>, memberName: string, defaultOptionId: string) {
    return signups[memberName] ?? defaultOptionId;
}

function SignupSummary({
    activity,
    signups,
}: {
    activity: SplittableActivity;
    signups: Record<string, string>;
}) {
    const { options, defaultOptionId } = activity;

    const namesForOption = (optionId: string) => {
        const explicit = Object.entries(signups)
            .filter(([, id]) => id === optionId)
            .map(([name]) => name);
        const onDefault = DEFAULT_PLANNER_SUGGESTIONS.filter(
            (name) => !signups[name] && defaultOptionId === optionId,
        );
        return [...explicit, ...onDefault];
    };

    const hasAny = options.some((opt) => namesForOption(opt.id).length > 0);

    if (!hasAny) {
        return (
            <p className="trip-signup-summary mt-4 text-[var(--trip-caption)] text-tertiary">
                No households yet — defaults show until someone taps a choice.
            </p>
        );
    }

    return (
        <div className="trip-signup-summary">
            <p className="trip-signup-summary-title">Household picks</p>
            {options.map((option) => {
                const names = namesForOption(option.id);
                if (names.length === 0) return null;
                const defaultOnly = names.every((name) => !signups[name]);
                return (
                    <p key={option.id} className="trip-signup-row">
                        <span className="trip-signup-row-label">
                            {option.label} · {names.length}
                        </span>
                        <span className="trip-signup-row-names">
                            {" "}
                            — {names.join(", ")}
                            {defaultOnly && names.length > 0 && (
                                <span className="text-tertiary"> (default until confirmed)</span>
                            )}
                        </span>
                    </p>
                );
            })}
        </div>
    );
}

function ActivitySignupCard({
    activity,
    memberName,
    signups,
    onPick,
}: {
    activity: SplittableActivity;
    memberName: string;
    signups: Record<string, string>;
    onPick: (optionId: string) => void;
}) {
    const savedPick = signups[memberName];
    const displayPick = resolvePick(signups, memberName, activity.defaultOptionId);
    const dayLabel = dayShortLabel(activity.dayId);
    const singleOption = activity.options.length === 1;

    return (
        <article className="trip-card p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[var(--trip-caption)] font-bold text-[var(--trip-accent)]">
                    {dayLabel}
                </span>
                <h4 className="text-[var(--trip-title-card)] font-semibold tracking-tight text-primary">{activity.title}</h4>
            </div>
            {activity.description && <p className="mt-1.5 text-[var(--trip-body-sm)] text-tertiary">{activity.description}</p>}

            <div className="trip-callout mt-4 py-3">
                {singleOption ? (
                    <p>
                        <span className="font-semibold text-primary">Tap below to confirm</span> your household is going to
                        Columbia.
                    </p>
                ) : (
                    <p>
                        <span className="font-semibold text-primary">Tap one option</span> for your household. A default is
                        highlighted — tap it to confirm or choose another.
                    </p>
                )}
            </div>

            <p className="mt-3 text-[var(--trip-caption)] font-semibold text-primary">
                {memberName}
                {savedPick ? (
                    <span className="trip-you-badge">Confirmed</span>
                ) : (
                    <span className="trip-you-badge trip-you-badge--muted">Default shown</span>
                )}
            </p>

            <div className="trip-option-grid mt-2" role="radiogroup" aria-label={`${activity.title} plan for ${memberName}`}>
                {activity.options.map((option) => {
                    const selected = displayPick === option.id;
                    const isDefaultPreview = !savedPick && option.id === activity.defaultOptionId;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            data-selected={selected}
                            data-default-preview={isDefaultPreview && !savedPick}
                            className="trip-option-card"
                            onClick={() => onPick(option.id)}
                        >
                            <span className="trip-option-card-title">{option.label}</span>
                            {option.description && <span className="trip-option-card-desc">{option.description}</span>}
                            {isDefaultPreview && !savedPick && (
                                <span className="trip-option-card-hint">Suggested · tap to confirm</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <SignupSummary activity={activity} signups={signups} />
        </article>
    );
}

function ChecklistRow({
    item,
    checked,
    doneBy,
    onToggle,
}: {
    item: ChecklistDef;
    checked: boolean;
    doneBy?: string;
    onToggle: () => void;
}) {
    return (
        <li
            data-done={checked}
            data-urgent={item.priority === "now" && !checked}
            className="trip-checklist-row"
        >
            <Checkbox isSelected={checked} onChange={onToggle} aria-label={item.title} />
            <div className="min-w-0 flex-1">
                <p className="trip-checklist-row-title">{item.title}</p>
                <p className="trip-checklist-row-detail">{item.detail}</p>
                {item.phone && <PhoneLine line={item.phone} />}
                {doneBy && checked && <p className="trip-checklist-row-meta">Done by {doneBy}</p>}
            </div>
        </li>
    );
}

export function CoordinatePanel() {
    const { state, memberName, setActivitySignup, toggleChecklist, resetChecklist } = useTrip();
    const [subTab, setSubTab] = useState<CoordinateSubTab>(readCoordinateSubTab);

    useEffect(() => {
        sessionStorage.setItem(COORDINATE_TAB_KEY, subTab);
    }, [subTab]);

    if (!memberName) return null;

    const doneCount = CHECKLIST.filter((item) => state.checklist[item.key]?.done).length;
    const urgentRemaining = CHECKLIST.filter((item) => item.priority === "now" && !state.checklist[item.key]?.done).length;

    return (
        <div className="space-y-5">
            <PanelHeader title="Coordinate" description="Book what needs reserving, then confirm plans for split outings." />

            <div
                className="flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1 ring-1 ring-[var(--trip-separator)] ring-inset scrollbar-hide"
                role="tablist"
                aria-label="Coordinate sections"
            >
                {COORDINATE_SUBTABS.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        data-active={subTab === id}
                        aria-selected={subTab === id}
                        className="trip-coordinate-tab"
                        onClick={() => setSubTab(id)}
                    >
                        {label}
                        {id === "actions" && urgentRemaining > 0 && (
                            <span className="trip-coordinate-tab-badge">{urgentRemaining}</span>
                        )}
                    </button>
                ))}
            </div>

            {subTab === "actions" && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <p className="trip-section-desc">
                            {urgentRemaining > 0
                                ? `${urgentRemaining} urgent ${urgentRemaining === 1 ? "item" : "items"} left`
                                : "Shared booking to-dos for planners"}
                        </p>
                        <Button
                            color="link-gray"
                            size="sm"
                            onClick={() => {
                                if (window.confirm("Clear all checklist checkmarks for everyone?")) resetChecklist();
                            }}
                        >
                            Clear checks
                        </Button>
                    </div>

                    <ChecklistProgress done={doneCount} total={CHECKLIST.length} label="Reservations" />

                    {CHECKLIST_GROUPS.map((group) => {
                        const items = CHECKLIST.filter((item) => item.priority === group.id);
                        if (items.length === 0) return null;

                        return (
                            <div key={group.id}>
                                <h4
                                    className={cx(
                                        "trip-checklist-section-title",
                                        group.urgent && "trip-checklist-section-title--urgent",
                                    )}
                                >
                                    {group.label}
                                </h4>
                                <ul className="space-y-2">
                                    {items.map((item) => {
                                        const meta = state.checklist[item.key];
                                        return (
                                            <ChecklistRow
                                                key={item.key}
                                                item={item}
                                                checked={meta?.done ?? false}
                                                doneBy={meta?.doneBy}
                                                onToggle={() => toggleChecklist(item.key)}
                                            />
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </section>
            )}

            {subTab === "plans" && (
                <section className="space-y-4">
                    {SPLITTABLE_ACTIVITIES.map((activity) => {
                        const key = rsvpKey(activity.dayId, activity.id);
                        const signups = state.activitySignups[key] ?? {};

                        return (
                            <ActivitySignupCard
                                key={activity.id}
                                activity={activity}
                                memberName={memberName}
                                signups={signups}
                                onPick={(optionId) => setActivitySignup(key, memberName, optionId)}
                            />
                        );
                    })}
                </section>
            )}
        </div>
    );
}
