import { cx } from "@/utils/cx";

const toneStyles = {
    sr: "bg-utility-success-50 text-utility-success-700 ring-utility-success-200",
    no: "bg-utility-error-50 text-utility-error-700 ring-utility-error-200",
    pay: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
    free: "bg-secondary text-secondary ring-secondary",
} as const;

export function TripBadge({ label, tone }: { label: string; tone: keyof typeof toneStyles }) {
    return (
        <span className={cx("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", toneStyles[tone])}>
            {label}
        </span>
    );
}

export function DayTag({ label, tone }: { label: string; tone: "easy" | "mod" | "big" }) {
    const styles = {
        easy: "bg-utility-success-50 text-utility-success-700",
        mod: "bg-utility-warning-50 text-utility-warning-700",
        big: "bg-utility-error-50 text-utility-error-700",
    };
    return <span className={cx("ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold", styles[tone])}>{label}</span>;
}

export function EffortBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-3 rounded-xl border border-utility-warning-200 bg-utility-warning-50 px-3 py-2.5 text-sm text-utility-warning-800">
            <b className="text-utility-warning-900">Effort &amp; access:</b> {children}
        </div>
    );
}

export function SyncIndicator({ status }: { status: string }) {
    const colors = {
        loading: "bg-utility-gray-300",
        connected: "bg-utility-success-500",
        offline: "bg-utility-warning-400",
        error: "bg-utility-error-500",
    } as const;
    const labels = {
        loading: "Connecting…",
        connected: "Live sync",
        offline: "Local only — set up Supabase for shared sync",
        error: "Sync error",
    } as const;

    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-tertiary">
            <span className={cx("size-2 rounded-full", colors[status as keyof typeof colors] ?? colors.loading)} />
            {labels[status as keyof typeof labels] ?? status}
        </span>
    );
}
