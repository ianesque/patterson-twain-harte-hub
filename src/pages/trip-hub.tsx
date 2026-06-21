import { useEffect, useState } from "react";
import {
    Calendar,
    CheckCircle,
    MarkerPin01,
    Building07,
    BookOpen01,
    User01,
    HomeLine,
} from "@untitledui/icons";
import { CoordinatePanel } from "@/components/trip/coordinate-panel";
import { GuidePanel, type GuideTabId } from "@/components/trip/guide-panel";
import { MealsPanel } from "@/components/trip/meals-panel";
import { StayPanel } from "@/components/trip/stay-panel";
import { HouseholdInitials } from "@/components/trip/household-initials";
import { MemberPicker } from "@/components/trip/member-picker";
import { PlanPanel } from "@/components/trip/plan-panel";
import { SavedToast, SyncTipBanner } from "@/components/trip/sync-feedback";
import { getTripHeroContext, TripMobileTabBar, TripSegmentedTabs } from "@/components/trip/trip-ui";
import { TRIP_META } from "@/data/trip-content";
import { clearStoredMember } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { TripProvider, useTrip } from "@/providers/trip-provider";

const TAB_KEY = "twain_harte_tab";
const GUIDE_KEY = "twain_harte_guide_tab";

const MAIN_TABS = [
    { id: "plan", label: "Plan", icon: Calendar },
    { id: "stay", label: "Stay", icon: Building07 },
    { id: "meals", label: "Meals", icon: HomeLine },
    { id: "coordinate", label: "Coordinate", icon: CheckCircle },
    { id: "guide", label: "Guide", icon: BookOpen01 },
] as const;

function TripShell() {
    const { memberName, savedFlash } = useTrip();
    const [tab, setTab] = useState(() => sessionStorage.getItem(TAB_KEY) ?? "plan");
    const [guideTab, setGuideTab] = useState<GuideTabId>(() => {
        const stored = sessionStorage.getItem(GUIDE_KEY);
        return stored === "gems" || stored === "game" ? stored : "activities";
    });
    const [heroContext, setHeroContext] = useState(() => getTripHeroContext());

    useEffect(() => {
        sessionStorage.setItem(TAB_KEY, tab);
    }, [tab]);

    useEffect(() => {
        sessionStorage.setItem(GUIDE_KEY, guideTab);
    }, [guideTab]);

    useEffect(() => {
        setHeroContext(getTripHeroContext());
        const id = window.setInterval(() => setHeroContext(getTripHeroContext()), 60_000);
        return () => window.clearInterval(id);
    }, []);

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
                            {heroContext && <p className="trip-hero-context">{heroContext}</p>}
                        </div>
                        <div className="trip-hero-toolbar">
                            <span className="trip-hero-chip" title={memberName}>
                                <HouseholdInitials
                                    householdName={memberName}
                                    size="sm"
                                    className="trip-hero-chip-avatar"
                                />
                                <span className="trip-hero-chip-name">{memberName}</span>
                            </span>
                            <button
                                type="button"
                                className="trip-icon-btn"
                                aria-label="Switch name"
                                onClick={() => {
                                    clearStoredMember();
                                    window.location.reload();
                                }}
                            >
                                <User01 />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {!isSupabaseConfigured && (
                <div className="border-b border-[var(--trip-separator)] bg-secondary px-4 py-2 text-center text-[var(--trip-caption)] text-tertiary">
                    Offline mode — changes stay on this device only
                </div>
            )}

            {isSupabaseConfigured && (
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <SyncTipBanner />
                </div>
            )}

            <div className="trip-nav-bar">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <TripSegmentedTabs tabs={[...MAIN_TABS]} active={tab} onChange={setTab} />
                </div>
            </div>

            <main className="trip-main-pad mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
                <div key={tab} className="trip-panel-enter">
                    {tab === "plan" && <PlanPanel />}
                    {tab === "stay" && <StayPanel />}
                    {tab === "meals" && <MealsPanel />}
                    {tab === "coordinate" && <CoordinatePanel />}
                    {tab === "guide" && <GuidePanel active={guideTab} onChange={setGuideTab} />}
                </div>
            </main>

            <TripMobileTabBar tabs={[...MAIN_TABS]} active={tab} onChange={setTab} />
            <SavedToast visible={savedFlash} live={isSupabaseConfigured} />

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
