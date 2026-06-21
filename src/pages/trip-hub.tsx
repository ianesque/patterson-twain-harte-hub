import { useState } from "react";
import {
    Calendar,
    CheckCircle,
    Compass03,
    Diamond01,
    LogOut01,
    MarkerPin01,
    Stars02,
    Users01,
    HomeLine,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Tabs } from "@/components/application/tabs/tabs";
import { CoordinatePanel } from "@/components/trip/coordinate-panel";
import { MealsPanel } from "@/components/trip/meals-panel";
import { MemberPicker } from "@/components/trip/member-picker";
import { PlanPanel } from "@/components/trip/plan-panel";
import {
    ActivitiesReferencePanel,
    GameNightReferencePanel,
    GemsReferencePanel,
} from "@/components/trip/reference-panels";
import { SyncIndicator } from "@/components/trip/trip-ui";
import { TRIP_META } from "@/data/trip-content";
import { clearAuthentication, clearStoredMember } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { TripProvider, useTrip } from "@/providers/trip-provider";

function TripShell() {
    const { syncStatus, lastUpdatedBy, lastUpdatedAt, memberName } = useTrip();
    const [tab, setTab] = useState("plan");

    if (!memberName) {
        return <MemberPicker />;
    }

    return (
        <div className="min-h-dvh bg-primary">
            <header className="bg-gradient-to-br from-[#1f5e4f] to-[#1d7fa3] text-white">
                <div className="mx-auto max-w-5xl px-4 py-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-display-xs font-semibold sm:text-display-sm">{TRIP_META.title}</h1>
                            <p className="mt-1 text-sm opacity-95">{TRIP_META.subtitle}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {TRIP_META.pills.map((pill) => (
                                    <span
                                        key={pill}
                                        className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold"
                                    >
                                        {pill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right text-sm">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-medium">
                                <Users01 className="size-4" /> {memberName}
                            </span>
                            <SyncIndicator status={syncStatus} />
                            {lastUpdatedBy && (
                                <span className="text-xs opacity-80">
                                    Last edit: {lastUpdatedBy}
                                    {lastUpdatedAt && ` · ${new Date(lastUpdatedAt).toLocaleString()}`}
                                </span>
                            )}
                            <Button
                                color="secondary"
                                size="sm"
                                iconLeading={LogOut01}
                                onClick={() => {
                                    clearAuthentication();
                                    clearStoredMember();
                                    window.location.reload();
                                }}
                                className="bg-white/10 text-white ring-white/30 hover:bg-white/20"
                            >
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {!isSupabaseConfigured && (
                <div className="border-b border-utility-warning-200 bg-utility-warning-50 px-4 py-2 text-center text-sm text-utility-warning-800">
                    Supabase not configured — changes save on this device only. Add secrets per README for live family sync.
                </div>
            )}

            <div className="sticky top-0 z-20 border-b border-secondary bg-primary/95 backdrop-blur">
                <div className="mx-auto max-w-5xl overflow-x-auto px-4 py-2">
                    <Tabs selectedKey={tab} onSelectionChange={(k) => setTab(String(k))}>
                        <Tabs.List type="button-border" size="sm" className="min-w-max">
                            <Tabs.Item id="plan" icon={Calendar}>
                                Plan
                            </Tabs.Item>
                            <Tabs.Item id="meals" icon={HomeLine}>
                                Meals
                            </Tabs.Item>
                            <Tabs.Item id="coordinate" icon={CheckCircle}>
                                Coordinate
                            </Tabs.Item>
                            <Tabs.Item id="activities" icon={Compass03}>
                                Activities
                            </Tabs.Item>
                            <Tabs.Item id="gems" icon={Diamond01}>
                                Gems
                            </Tabs.Item>
                            <Tabs.Item id="game" icon={Stars02}>
                                Game Night
                            </Tabs.Item>
                        </Tabs.List>
                    </Tabs>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-6 pb-16">
                {tab === "plan" && <PlanPanel />}
                {tab === "meals" && <MealsPanel />}
                {tab === "coordinate" && <CoordinatePanel />}
                {tab === "activities" && <ActivitiesReferencePanel />}
                {tab === "gems" && <GemsReferencePanel />}
                {tab === "game" && <GameNightReferencePanel />}
            </main>

            <footer className="border-t border-secondary py-6 text-center text-xs text-quaternary">
                <p className="inline-flex items-center justify-center gap-1">
                    <MarkerPin01 className="size-3.5" /> Twain Harte, CA · Jun 23–27, 2026
                </p>
                <p className="mt-1">Confirm prices &amp; hours by phone when booking.</p>
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
