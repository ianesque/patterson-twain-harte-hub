import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    CheckCircle,
    Compass03,
    Diamond01,
    LogOut01,
    MarkerPin01,
    Stars02,
    HomeLine,
    BookOpen01,
} from "@untitledui/icons";
import { CoordinatePanel } from "@/components/trip/coordinate-panel";
import { MealsPanel } from "@/components/trip/meals-panel";
import { MemberPicker } from "@/components/trip/member-picker";
import { PlanPanel } from "@/components/trip/plan-panel";
import {
    ActivitiesReferencePanel,
    GameNightReferencePanel,
    GemsReferencePanel,
} from "@/components/trip/reference-panels";
import { SyncIndicator, TripMobileTabBar, TripSegmentedTabs } from "@/components/trip/trip-ui";
import { TRIP_META } from "@/data/trip-content";
import { clearAuthentication, clearStoredMember } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { TripProvider, useTrip } from "@/providers/trip-provider";
import { cx } from "@/utils/cx";

const TAB_KEY = "twain_harte_tab";
const GUIDE_KEY = "twain_harte_guide_tab";

const MAIN_TABS = [
    { id: "plan", label: "Plan", icon: Calendar },
    { id: "meals", label: "Meals", icon: HomeLine },
    { id: "coordinate", label: "Coordinate", icon: CheckCircle },
    { id: "guide", label: "Guide", icon: BookOpen01 },
] as const;

function plannerInitials(name: string) {
    return name
        .split(/\s*&\s*|\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function TripShell() {
    const { syncStatus, memberName } = useTrip();
    const [tab, setTab] = useState(() => sessionStorage.getItem(TAB_KEY) ?? "plan");
    const [guideTab, setGuideTab] = useState(() => sessionStorage.getItem(GUIDE_KEY) ?? "activities");

    useEffect(() => {
        sessionStorage.setItem(TAB_KEY, tab);
    }, [tab]);

    useEffect(() => {
        sessionStorage.setItem(GUIDE_KEY, guideTab);
    }, [guideTab]);

    const guideTabs = useMemo(
        () => [
            { id: "activities", label: "Activities", icon: Compass03 },
            { id: "gems", label: "Local gems", icon: Diamond01 },
            { id: "game", label: "Game night", icon: Stars02 },
        ],
        [],
    );

    if (!memberName) {
        return <MemberPicker />;
    }

    return (
        <div className="trip-surface min-h-dvh">
            <header className="trip-hero trip-hero-compact">
                <div className="mx-auto max-w-5xl px-4 pt-3 sm:px-6 sm:pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="trip-hero-title">Twain Harte</h1>
                            <p className="trip-hero-dates">Jun 23–27, 2026</p>
                        </div>
                        <div className="trip-hero-toolbar">
                            <SyncIndicator status={syncStatus} compact />
                            <span className="trip-hero-chip" title={memberName}>
                                <span className="trip-hero-chip-avatar" aria-hidden>
                                    {plannerInitials(memberName)}
                                </span>
                                <span className="trip-hero-chip-name">{memberName}</span>
                            </span>
                            <a
                                href={TRIP_META.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="trip-icon-btn"
                                aria-label="Open rental address in Maps"
                            >
                                <MarkerPin01 />
                            </a>
                            <button
                                type="button"
                                className="trip-icon-btn"
                                aria-label="Switch planner"
                                onClick={() => {
                                    clearAuthentication();
                                    clearStoredMember();
                                    window.location.reload();
                                }}
                            >
                                <LogOut01 />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {!isSupabaseConfigured && (
                <div className="border-b border-[var(--trip-separator)] bg-secondary px-4 py-2 text-center text-[var(--trip-caption)] text-tertiary">
                    Offline mode
                </div>
            )}

            <div className={cx("trip-nav-bar", tab === "guide" && "trip-nav-bar--guide-only")}>
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <TripSegmentedTabs tabs={[...MAIN_TABS]} active={tab} onChange={setTab} />

                    {tab === "guide" && (
                        <div className="flex gap-1 overflow-x-auto py-2.5 scrollbar-hide sm:border-t sm:border-[var(--trip-separator)] sm:pb-3">
                            {guideTabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    data-active={guideTab === id}
                                    onClick={() => setGuideTab(id)}
                                    className="trip-guide-pill"
                                >
                                    <Icon />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <main className="trip-main-pad mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
                {tab === "plan" && <PlanPanel />}
                {tab === "meals" && <MealsPanel />}
                {tab === "coordinate" && <CoordinatePanel />}
                {tab === "guide" && guideTab === "activities" && <ActivitiesReferencePanel />}
                {tab === "guide" && guideTab === "gems" && <GemsReferencePanel />}
                {tab === "guide" && guideTab === "game" && <GameNightReferencePanel />}
            </main>

            <TripMobileTabBar tabs={[...MAIN_TABS]} active={tab} onChange={setTab} />

            <footer className="hidden border-t border-[var(--trip-separator)] bg-primary py-8 text-center sm:block">
                <p className="inline-flex items-center justify-center gap-1.5 text-[var(--trip-caption)] text-quaternary">
                    <MarkerPin01 className="size-3.5" />
                    {TRIP_META.address}
                </p>
            </footer>
        </div>
    );
}

export function TripHubPage() {
    return (
        <TripProvider>
            <TripShell />
        </TripProvider>
    );
}
