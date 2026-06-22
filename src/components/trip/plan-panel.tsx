import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import {
    Camera01,
    Clock,
    Compass03,
    HomeLine,
    MarkerPin01,
    Stars02,
    Sun,
} from "@untitledui/icons";
import { TextArea } from "@/components/base/textarea/textarea";
import { DAYS, TRIP_META } from "@/data/trip-content";
import { YourStaySection } from "@/components/trip/your-stay-section";
import { DayHeader, EffortBox, getTripDayHighlight, PanelHeader } from "@/components/trip/trip-ui";
import { useTrip } from "@/providers/trip-provider";
import { cx } from "@/utils/cx";

const PLAN_TAB_KEY = "twain_harte_plan_tab";

const PLAN_SUBTABS = [
    { id: "activities", label: "Activities" },
    { id: "rooms", label: "Rooms" },
] as const;

type PlanSubTab = (typeof PLAN_SUBTABS)[number]["id"];

function readPlanSubTab(): PlanSubTab {
    const stored = sessionStorage.getItem(PLAN_TAB_KEY);
    if (stored === "rooms") return "rooms";
    return "activities";
}

const ROW_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
    "🏠": HomeLine,
    "🚗": MarkerPin01,
    "🏊": Sun,
    "🍦": Sun,
    "⛵": Compass03,
    "🏖️": Sun,
    "⏰": Clock,
    "📸": Camera01,
    "🐟": Compass03,
    "🎣": Compass03,
    "🎬": Stars02,
    "🚣": Compass03,
    "🥾": Compass03,
    "🛍️": MarkerPin01,
    "🏡": HomeLine,
};

function PlanRowIcon({ emoji }: { emoji: string }) {
    const Icon = ROW_ICON_MAP[emoji] ?? Compass03;
    return (
        <span className="trip-plan-row-icon" aria-hidden>
            <Icon />
        </span>
    );
}

function ActivitiesSubPanel() {
    const { state, updateDayNotes } = useTrip();
    const [activeDay, setActiveDay] = useState<string>(DAYS[0]?.id ?? "");
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current?.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible?.target.id.startsWith("day-")) {
                    setActiveDay(visible.target.id.replace("day-", ""));
                }
            },
            { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
        );

        for (const day of DAYS) {
            const el = document.getElementById(`day-${day.id}`);
            if (el) observerRef.current.observe(el);
        }

        return () => observerRef.current?.disconnect();
    }, []);

    function scrollToDay(dayId: string) {
        setActiveDay(dayId);
        document.getElementById(`day-${dayId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <div className="space-y-6">
            <PanelHeader title="This week" description="One main outing per day. Add notes everyone can see." />

            <p className="trip-callout">
                Check-in Tue 4 PM ·{" "}
                <a href={TRIP_META.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--trip-accent)]">
                    {TRIP_META.address}
                </a>
            </p>

            <div className="trip-day-chip-row">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {DAYS.map((day) => (
                        <button
                            key={day.id}
                            type="button"
                            data-active={activeDay === day.id}
                            className="trip-day-chip"
                            onClick={() => scrollToDay(day.id)}
                        >
                            <span className="text-[var(--trip-caption)] font-bold uppercase text-tertiary">{day.weekday}</span>
                            <span className="text-[1.375rem] font-bold leading-none tracking-tight text-primary">{day.dayNum}</span>
                        </button>
                    ))}
                </div>
            </div>

            {DAYS.map((day, index) => {
                const highlight = getTripDayHighlight(day.id);

                return (
                    <article
                        key={day.id}
                        id={`day-${day.id}`}
                        className={cx(
                            "trip-card trip-plan-card scroll-mt-24 overflow-hidden sm:scroll-mt-28",
                            (highlight === "today" || highlight === "upcoming") && "ring-2 ring-[var(--trip-accent)]/40",
                        )}
                        style={{ animationDelay: `${0.03 + index * 0.03}s` }}
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
                                <div key={row.title} className="flex gap-3 text-[var(--trip-body-sm)] leading-relaxed sm:text-[var(--trip-body)]">
                                    <PlanRowIcon emoji={row.icon} />
                                    <p>
                                        <span className="font-semibold text-primary">{row.title}</span>
                                        <span className="trip-plan-row-sep" aria-hidden>
                                            {" "}
                                            —{" "}
                                        </span>
                                        {row.body}
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

export function PlanPanel() {
    const [subTab, setSubTab] = useState<PlanSubTab>(() => readPlanSubTab());

    useEffect(() => {
        sessionStorage.setItem(PLAN_TAB_KEY, subTab);
    }, [subTab]);

    return (
        <div className="space-y-5">
            <div
                className="flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1 ring-1 ring-[var(--trip-separator)] ring-inset scrollbar-hide"
                role="tablist"
                aria-label="Plan sections"
            >
                {PLAN_SUBTABS.map(({ id, label }) => (
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
                    </button>
                ))}
            </div>

            {subTab === "activities" && <ActivitiesSubPanel />}
            {subTab === "rooms" && (
                <div className="space-y-5">
                    <PanelHeader title="Rooms" description="Where we're sleeping — find your household first." />
                    <YourStaySection />
                </div>
            )}
        </div>
    );
}
