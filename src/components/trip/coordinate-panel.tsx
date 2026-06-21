import { useEffect, useMemo, useRef, useState } from "react";
import { Edit01, Plus, Trash01, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import {
    confirmedAttendeesForActivity,
    formatHeadcount,
    getHouseholdSize,
    migrateActivityPlan,
    totalConfirmedHeadcount,
} from "@/lib/activity-signups";
import { getCoordinateActivities, rsvpDayOptions, type CoordinateActivity } from "@/lib/activities";
import { CHECKLIST, DAYS, RSVP_ACTIVITIES } from "@/data/trip-content";
import { DEFAULT_PLANNER_SUGGESTIONS, rsvpKey, type DayId, type HouseholdActivityPlan, type TripCollaborationState } from "@/lib/types";
import { useTrip } from "@/providers/trip-provider";
import type { ChecklistDef } from "@/data/trip-content";
import { ChecklistProgress, PanelHeader, PhoneLine } from "@/components/trip/trip-ui";
import { HouseholdInitials } from "@/components/trip/household-initials";
import { cx } from "@/utils/cx";

const COORDINATE_TAB_KEY = "twain_harte_coordinate_tab";

const CHECKLIST_GROUPS: { id: ChecklistDef["priority"]; label: string; urgent?: boolean }[] = [
    { id: "now", label: "Do first", urgent: true },
    { id: "soon", label: "Before the trip", urgent: false },
    { id: "flex", label: "When you can", urgent: false },
];

const COORDINATE_SUBTABS = [
    { id: "actions", label: "Bookings" },
    { id: "plans", label: "Who's going" },
] as const;

type CoordinateSubTab = (typeof COORDINATE_SUBTABS)[number]["id"];

function readCoordinateSubTab(): CoordinateSubTab {
    const stored = sessionStorage.getItem(COORDINATE_TAB_KEY);
    if (stored === "actions") return "actions";
    return "plans";
}

function HeadcountStepper({
    value,
    min,
    max,
    onChange,
    compact,
    pulse,
}: {
    value: number;
    min: number;
    max: number;
    onChange: (next: number) => void;
    compact?: boolean;
    pulse?: boolean;
}) {
    return (
        <div
            className={cx("trip-headcount-stepper", compact && "trip-headcount-stepper--compact", pulse && "trip-headcount-stepper--pulse")}
            role="group"
            aria-label="How many from your family"
        >
            <button
                type="button"
                className="trip-headcount-btn"
                aria-label="Fewer"
                disabled={value <= min}
                onClick={() => onChange(Math.max(min, value - 1))}
            >
                −
            </button>
            <span className="trip-headcount-value" aria-live="polite" data-count={value}>
                {value}
            </span>
            <button
                type="button"
                className="trip-headcount-btn"
                aria-label="More"
                disabled={value >= max}
                onClick={() => onChange(Math.min(max, value + 1))}
            >
                +
            </button>
        </div>
    );
}

function WhoIsGoing({
    attendees,
    total,
}: {
    attendees: ReturnType<typeof confirmedAttendeesForActivity>;
    total: number;
}) {
    if (attendees.length === 0) {
        return (
            <div className="trip-rsvp-crew trip-rsvp-crew--empty">
                <span className="trip-rsvp-crew-label">Who's going</span>
                <p className="trip-rsvp-crew-empty">No confirmed RSVPs yet</p>
            </div>
        );
    }

    return (
        <div className="trip-rsvp-crew">
            <div className="trip-rsvp-crew-header">
                <span className="trip-rsvp-crew-label">Who's going</span>
                <span className="trip-rsvp-crew-total">{formatHeadcount(total)}</span>
            </div>
            <ul className="trip-rsvp-crew-list" aria-label="Confirmed households">
                {attendees.map((row) => (
                    <li key={row.household} className="trip-rsvp-crew-chip" data-you={row.isYou}>
                        <HouseholdInitials
                            householdName={row.household}
                            size="xs"
                            className="trip-rsvp-crew-avatar"
                        />
                        <span className="trip-rsvp-crew-name">{row.isYou ? "You" : row.household.split(/[\s&]+/)[0]}</span>
                        <span className="trip-rsvp-crew-count">{row.count}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ActivitySignupCard({
    activity,
    memberName,
    signups,
    familySize,
    state,
    cardIndex,
    onSetPlan,
    onEdit,
}: {
    activity: CoordinateActivity;
    memberName: string;
    signups: Record<string, HouseholdActivityPlan>;
    familySize: number;
    state: TripCollaborationState;
    cardIndex: number;
    onSetPlan: (plan: HouseholdActivityPlan) => void;
    onEdit: () => void;
}) {
    const option = activity.options[0];
    const plan = migrateActivityPlan(signups[memberName], memberName, state);
    const goingCount = plan?.count ?? 0;
    const confirmed = plan?.confirmed ?? false;
    const [countPulse, setCountPulse] = useState(false);

    const attendees = confirmedAttendeesForActivity(
        activity,
        signups,
        DEFAULT_PLANNER_SUGGESTIONS,
        state,
        memberName,
    );
    const crewTotal = totalConfirmedHeadcount(attendees);

    function persistCount(count: number) {
        if (!option) return;
        onSetPlan({
            optionId: option.id,
            count: Math.min(Math.max(0, count), familySize),
            confirmed: true,
        });
    }

    function adjustCount(next: number) {
        setCountPulse(true);
        window.setTimeout(() => setCountPulse(false), 350);
        persistCount(next);
    }

    const staggerDelay = Math.min(cardIndex * 0.05, 0.35);

    return (
        <article
            className="trip-rsvp-card trip-card"
            style={{ animationDelay: `${staggerDelay}s` }}
            data-confirmed={confirmed && goingCount > 0}
        >
            <header className="trip-rsvp-card-header">
                <span className="trip-rsvp-emoji" aria-hidden>
                    {activity.emoji}
                </span>
                <div className="min-w-0 flex-1">
                    <h4 className="trip-rsvp-card-title">{activity.title}</h4>
                    {activity.description && <p className="trip-rsvp-card-desc">{activity.description}</p>}
                </div>
                <button
                    type="button"
                    className="trip-rsvp-edit-btn"
                    aria-label={`Edit ${activity.title}`}
                    onClick={onEdit}
                >
                    <Edit01 aria-hidden />
                </button>
            </header>

            <WhoIsGoing attendees={attendees} total={crewTotal} />

            <div className="trip-rsvp-your-row">
                <div className="trip-rsvp-your-label">
                    <span className="font-semibold text-primary">Your family</span>
                    <span className="trip-rsvp-family-cap">{familySize} max</span>
                </div>

                <HeadcountStepper
                    value={goingCount}
                    min={0}
                    max={familySize}
                    onChange={adjustCount}
                    compact
                    pulse={countPulse}
                />
            </div>
        </article>
    );
}

type ActivityFormMode = { kind: "add" } | { kind: "edit"; activity: CoordinateActivity };

function ActivityFormModal({
    mode,
    defaultDayId,
    onClose,
}: {
    mode: ActivityFormMode;
    defaultDayId?: DayId;
    onClose: () => void;
}) {
    const {
        memberName,
        addCustomActivity,
        updateCustomActivity,
        deleteCustomActivity,
        setActivityOverride,
    } = useTrip();

    const editing = mode.kind === "edit" ? mode.activity : null;
    const isCustom = editing?.isCustom ?? true;

    const [dayId, setDayId] = useState<DayId>(editing?.dayId ?? defaultDayId ?? "wed-24");
    const [title, setTitle] = useState(editing?.title ?? "");
    const [description, setDescription] = useState(editing?.description ?? "");
    const [emoji, setEmoji] = useState(editing?.emoji ?? "");
    const createdIdRef = useRef<string | null>(editing?.isCustom ? editing.id : null);

    useEffect(() => {
        if (mode.kind === "add") {
            createdIdRef.current = null;
            setDayId(defaultDayId ?? "wed-24");
            setTitle("");
            setDescription("");
            setEmoji("");
        } else {
            createdIdRef.current = mode.activity.isCustom ? mode.activity.id : null;
            setDayId(mode.activity.dayId);
            setTitle(mode.activity.title);
            setDescription(mode.activity.description);
            setEmoji(mode.activity.emoji);
        }
    }, [mode, defaultDayId]);

    function persist(next: { dayId?: DayId; title?: string; description?: string; emoji?: string }) {
        const nextTitle = (next.title ?? title).trim();
        const nextDescription = next.description ?? description;
        const nextEmoji = next.emoji ?? emoji;
        const nextDayId = next.dayId ?? dayId;

        if (mode.kind === "edit" && editing) {
            if (editing.isCustom) {
                updateCustomActivity(editing.id, {
                    dayId: nextDayId,
                    title: nextTitle,
                    description: nextDescription,
                    emoji: nextEmoji,
                });
            } else if (nextTitle) {
                const builtIn = RSVP_ACTIVITIES.find(
                    (activity) => activity.id === editing.id && activity.dayId === editing.dayId,
                );
                const override = {
                    title: builtIn && nextTitle !== builtIn.title ? nextTitle : undefined,
                    description:
                        builtIn && nextDescription !== builtIn.description ? nextDescription : undefined,
                    emoji: builtIn && nextEmoji !== builtIn.emoji ? nextEmoji : undefined,
                };
                const hasOverride = Object.values(override).some((value) => value !== undefined);
                setActivityOverride(rsvpKey(editing.dayId, editing.id), hasOverride ? override : null);
            }
            return;
        }

        if (!nextTitle) return;

        if (createdIdRef.current) {
            updateCustomActivity(createdIdRef.current, {
                dayId: nextDayId,
                title: nextTitle,
                description: nextDescription,
                emoji: nextEmoji,
            });
        } else {
            createdIdRef.current = addCustomActivity({
                dayId: nextDayId,
                title: nextTitle,
                description: nextDescription.trim() || undefined,
                emoji: nextEmoji.trim() || undefined,
            });
        }
    }

    function handleDelete() {
        if (!editing?.isCustom) return;
        if (!window.confirm(`Delete "${editing.title}"? RSVPs for this activity will be removed.`)) return;
        deleteCustomActivity(editing.id);
        onClose();
    }

    const heading = mode.kind === "add" ? "Add activity" : editing?.isCustom ? "Edit activity" : "Edit display";
    const canDelete = mode.kind === "edit" && editing?.isCustom;

    return (
        <ModalOverlay
            isOpen
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            isDismissable
        >
            <Modal className="w-full max-w-md">
                <Dialog aria-label={heading} className="p-5 sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-primary">{heading}</h3>
                            <p className="mt-1 text-sm text-tertiary">
                                {mode.kind === "add"
                                    ? "Everyone on the trip will see this outing."
                                    : editing?.isCustom
                                      ? "Update details for the whole group."
                                      : "Customize how this built-in activity appears for everyone."}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="trip-modal-close"
                            aria-label="Close"
                            onClick={onClose}
                        >
                            <XClose aria-hidden />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <NativeSelect
                            label="Day"
                            size="sm"
                            value={dayId}
                            disabled={mode.kind === "edit" && !isCustom}
                            options={rsvpDayOptions()}
                            onChange={(event) => {
                                const nextDay = event.target.value as DayId;
                                setDayId(nextDay);
                                persist({ dayId: nextDay });
                            }}
                        />
                        <Input
                            label="Activity title"
                            isRequired
                            size="sm"
                            value={title}
                            onChange={(value) => {
                                setTitle(value);
                                persist({ title: value });
                            }}
                            placeholder="e.g. Mini golf"
                        />
                        <TextArea
                            label="Description"
                            value={description}
                            onChange={(value) => {
                                setDescription(value);
                                persist({ description: value });
                            }}
                            rows={3}
                            placeholder="Optional details for the group"
                        />
                        <Input
                            label="Emoji"
                            size="sm"
                            value={emoji}
                            onChange={(value) => {
                                setEmoji(value);
                                persist({ emoji: value });
                            }}
                            placeholder="Optional — e.g. ⛳"
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        {canDelete ? (
                            <Button color="link-gray" size="sm" iconLeading={Trash01} onClick={handleDelete}>
                                Delete activity
                            </Button>
                        ) : (
                            <span />
                        )}
                        <Button color="secondary" size="sm" onClick={onClose}>
                            Done
                        </Button>
                    </div>

                    {memberName && (
                        <p className="mt-3 text-xs text-quaternary">Changes save automatically for everyone.</p>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
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
    const { state, memberName, setActivityPlan, toggleChecklist, resetChecklist } = useTrip();
    const doneCount = CHECKLIST.filter((item) => state.checklist[item.key]?.done).length;
    const urgentRemaining = CHECKLIST.filter((item) => item.priority === "now" && !state.checklist[item.key]?.done).length;
    const [subTab, setSubTab] = useState<CoordinateSubTab>(() => readCoordinateSubTab());
    const [activityForm, setActivityForm] = useState<ActivityFormMode | null>(null);

    useEffect(() => {
        sessionStorage.setItem(COORDINATE_TAB_KEY, subTab);
    }, [subTab]);

    const coordinateActivities = useMemo(() => getCoordinateActivities(state), [state]);

    const activitiesByDay = useMemo(() => {
        const order = ["wed-24", "thu-25", "fri-26", "sat-27"] as DayId[];
        return order
            .filter((dayId) => coordinateActivities.some((activity) => activity.dayId === dayId))
            .map((dayId) => ({
                dayId,
                activities: coordinateActivities.filter((activity) => activity.dayId === dayId),
            }));
    }, [coordinateActivities]);

    if (!memberName) return null;

    const signupsByKey = Object.fromEntries(
        coordinateActivities.map((activity) => [
            rsvpKey(activity.dayId, activity.id),
            state.activitySignups[rsvpKey(activity.dayId, activity.id)] ?? {},
        ]),
    );

    let cardIndex = 0;

    return (
        <div className="space-y-5">
            <PanelHeader title="Coordinate" description="Book what needs reserving, then say how many from each family are going." />

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
                <section className="space-y-5 trip-rsvp-panel">
                    <div className="w-full">
                        <Button
                            color="primary"
                            size="md"
                            iconLeading={Plus}
                            className="w-full"
                            onClick={() => setActivityForm({ kind: "add" })}
                        >
                            Add activity
                        </Button>
                    </div>

                    {activitiesByDay.map(({ dayId, activities }) => (
                        <div key={dayId} className="trip-rsvp-day-group">
                            <DayPlanGroupHeader dayId={dayId} />
                            <div className="trip-rsvp-day-grid">
                                {activities.map((activity) => {
                                    const key = rsvpKey(activity.dayId, activity.id);
                                    const signups = signupsByKey[key] ?? {};
                                    const familySize = getHouseholdSize(state, memberName);
                                    const index = cardIndex++;

                                    return (
                                        <ActivitySignupCard
                                            key={activity.id}
                                            activity={activity}
                                            memberName={memberName}
                                            signups={signups}
                                            familySize={familySize}
                                            state={state}
                                            cardIndex={index}
                                            onSetPlan={(plan) => setActivityPlan(key, memberName, plan)}
                                            onEdit={() => setActivityForm({ kind: "edit", activity })}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {activityForm && (
                <ActivityFormModal
                    mode={activityForm}
                    defaultDayId={activitiesByDay[0]?.dayId}
                    onClose={() => setActivityForm(null)}
                />
            )}
        </div>
    );
}

function DayPlanGroupHeader({ dayId }: { dayId: DayId }) {
    const day = DAYS.find((d) => d.id === dayId);
    if (!day) return null;

    return (
        <header className="trip-rsvp-day-group-header">
            <span className="trip-rsvp-day-group-date">
                {day.weekday} {day.dayNum}
            </span>
            <span className="trip-rsvp-day-group-theme">{day.title}</span>
        </header>
    );
}
