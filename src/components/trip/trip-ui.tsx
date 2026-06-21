import type { ComponentType, ReactNode } from "react";
import { cx } from "@/utils/cx";

const toneStyles = {
    sr: "bg-[var(--trip-sage-soft)] text-[var(--trip-sage)] ring-[var(--trip-separator)]",
    no: "bg-utility-error-50 text-utility-error-700 ring-utility-error-200 dark:bg-utility-error-950 dark:text-utility-error-300",
    pay: "bg-[var(--trip-accent-soft)] text-[var(--trip-accent)] ring-[var(--trip-separator)]",
    free: "bg-secondary text-secondary ring-secondary",
} as const;

export function TripBadge({ label, tone }: { label: string; tone: keyof typeof toneStyles }) {
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-md px-2.5 py-1 text-[var(--trip-caption)] font-semibold ring-1 ring-inset",
                toneStyles[tone],
            )}
        >
            {label}
        </span>
    );
}

export function DayTag({ label, tone }: { label: string; tone: "easy" | "mod" | "big" }) {
    const styles = {
        easy: "bg-[var(--trip-sage-soft)] text-[var(--trip-sage)]",
        mod: "bg-utility-warning-50 text-utility-warning-700 dark:bg-utility-warning-950 dark:text-utility-warning-300",
        big: "bg-utility-error-50 text-utility-error-700 dark:bg-utility-error-950 dark:text-utility-error-300",
    };
    return (
        <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-[var(--trip-caption)] font-bold", styles[tone])}>
            {label}
        </span>
    );
}

export function EffortBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="trip-effort">
            <b>Access · </b>
            {children}
        </div>
    );
}

export function PanelHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
                <h2 className="trip-section-title">{title}</h2>
                {description && <p className="trip-section-desc">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function DayHeader({
    weekday,
    dayNum,
    title,
    theme,
    tag,
    tagTone,
    highlight,
}: {
    weekday: string;
    dayNum: string;
    title: string;
    theme?: string;
    tag?: string;
    tagTone?: "easy" | "mod" | "big";
    highlight?: "today" | "upcoming" | false;
}) {
    return (
        <div className="flex items-start gap-3.5">
            <div
                className={cx(
                    "flex size-[3.75rem] shrink-0 flex-col items-center justify-center rounded-2xl text-[var(--trip-caption)] font-bold text-white shadow-sm",
                    highlight === "today" ? "bg-[#ff9f0a]" : "bg-brand-solid",
                )}
            >
                <span className="opacity-90">{weekday}</span>
                <span className="text-[1.5rem] leading-none tracking-tight">{dayNum}</span>
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <h3 className="text-[var(--trip-title-card)] font-semibold tracking-tight text-primary">{title}</h3>
                    {highlight === "today" && (
                        <span className="rounded-full bg-[#ff9f0a]/15 px-2.5 py-0.5 text-[var(--trip-caption)] font-bold text-[#c93400] dark:text-[#ff9f0a]">
                            Today
                        </span>
                    )}
                    {highlight === "upcoming" && (
                        <span className="rounded-full bg-[var(--trip-accent-soft)] px-2.5 py-0.5 text-[var(--trip-caption)] font-bold text-[var(--trip-accent)]">
                            Next up
                        </span>
                    )}
                    {tag && tagTone && <DayTag label={tag} tone={tagTone} />}
                </div>
                {theme && <p className="mt-1 text-[var(--trip-body-sm)] font-medium text-[var(--trip-accent)]">{theme}</p>}
            </div>
        </div>
    );
}

export function SyncIndicator({ status, compact }: { status: string; compact?: boolean }) {
    const colors = {
        loading: "bg-tertiary",
        connected: "bg-[#34c759]",
        offline: "bg-[#ff9f0a]",
        error: "bg-[#ff3b30]",
    } as const;
    const labels = {
        loading: "Connecting…",
        connected: "Live sync",
        offline: "This device only",
        error: "Sync error",
    } as const;
    const label = labels[status as keyof typeof labels] ?? status;

    if (compact) {
        return (
            <span
                className="inline-flex size-[2.75rem] items-center justify-center"
                title={label}
                aria-label={label}
            >
                <span className={cx("size-2.5 rounded-full ring-2 ring-[var(--trip-bg-elevated)]", colors[status as keyof typeof colors] ?? colors.loading)} />
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 text-[var(--trip-caption)] font-medium text-tertiary">
            <span className={cx("size-2.5 rounded-full", colors[status as keyof typeof colors] ?? colors.loading)} />
            {label}
        </span>
    );
}

export function ChecklistProgress({ done, total, label = "To-do" }: { done: number; total: number; label?: string }) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return (
        <div className="trip-card px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between">
                <span className="text-[var(--trip-body-sm)] font-semibold text-primary">{label}</span>
                <span className="text-[var(--trip-caption)] font-medium text-tertiary">
                    {done}/{total}
                </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-brand-solid transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function RsvpPills({
    value,
    onChange,
}: {
    value?: "in" | "maybe" | "out";
    onChange: (v: "in" | "maybe" | "out") => void;
}) {
    const options: { v: "in" | "maybe" | "out"; label: string }[] = [
        { v: "in", label: "In" },
        { v: "maybe", label: "Maybe" },
        { v: "out", label: "Out" },
    ];

    return (
        <div
            className="inline-flex w-full max-w-md rounded-xl bg-secondary p-1 ring-1 ring-[var(--trip-separator)] ring-inset sm:w-auto"
            role="group"
            aria-label="Your response"
        >
            {options.map((opt) => (
                <button
                    key={opt.v}
                    type="button"
                    onClick={() => onChange(opt.v)}
                    className={cx(
                        "min-h-[2.75rem] flex-1 rounded-lg px-4 text-[var(--trip-body-sm)] font-semibold transition-colors sm:min-w-[5rem] sm:flex-none",
                        value === opt.v ? "bg-brand-solid text-white shadow-sm" : "text-tertiary",
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export function PhoneLine({ line }: { line: string }) {
    const match = line.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/);
    if (!match) {
        return <p className="mt-1 text-[var(--trip-body-sm)] text-secondary">{line}</p>;
    }
    const tel = `+1${match[1]}${match[2]}${match[3]}`;
    const display = line.replace(/📞\s*/, "");
    return (
        <a
            href={`tel:${tel}`}
            className="mt-1 inline-flex min-h-[2.75rem] items-center text-[var(--trip-body-sm)] font-semibold text-[var(--trip-accent)] active:opacity-70"
        >
            📞 {display}
        </a>
    );
}

export const HOUSEHOLD_ACCENTS = ["#0071e3", "#5a8a7a", "#5856d6", "#ff9f0a", "#af52de"] as const;

export function getTripDayHighlight(dayId: string): "today" | "upcoming" | false {
    const dayDates: Record<string, string> = {
        "tue-23": "2026-06-23",
        "wed-24": "2026-06-24",
        "thu-25": "2026-06-25",
        "fri-26": "2026-06-26",
        "sat-27": "2026-06-27",
    };
    const today = new Date().toISOString().slice(0, 10);
    const tripDate = dayDates[dayId];
    if (!tripDate) return false;
    if (tripDate === today) return "today";
    if (tripDate > today) {
        const firstUpcoming = Object.values(dayDates).sort().find((d) => d >= today);
        return tripDate === firstUpcoming ? "upcoming" : false;
    }
    return false;
}

export type TabDef = {
    id: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
};

export function TripMobileTabBar({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
    return (
        <nav className="trip-tab-bar" aria-label="Main">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    role="tab"
                    data-active={active === id}
                    className="trip-tab-bar-item"
                    aria-selected={active === id}
                    aria-current={active === id ? "page" : undefined}
                    onClick={() => onChange(id)}
                >
                    <Icon aria-hidden />
                    <span className="trip-tab-bar-label">{label}</span>
                </button>
            ))}
        </nav>
    );
}

export function TripSegmentedTabs({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
    return (
        <div className="trip-segmented" role="tablist" aria-label="Main">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    role="tab"
                    data-active={active === id}
                    className="trip-segment"
                    aria-selected={active === id}
                    aria-current={active === id ? "page" : undefined}
                    onClick={() => onChange(id)}
                >
                    <Icon aria-hidden />
                    <span className="trip-segment-label">{label}</span>
                </button>
            ))}
        </div>
    );
}
