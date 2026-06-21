import type { ComponentType } from "react";
import { Compass03, Diamond01, Stars02 } from "@untitledui/icons";
import {
    ActivitiesReferencePanel,
    GameNightReferencePanel,
    GemsReferencePanel,
} from "@/components/trip/reference-panels";
import { PanelHeader } from "@/components/trip/trip-ui";

const GUIDE_TABS = [
    { id: "activities", label: "Activities", icon: Compass03 },
    { id: "gems", label: "Local gems", icon: Diamond01 },
    { id: "game", label: "Game night", icon: Stars02 },
] as const;

export type GuideTabId = (typeof GUIDE_TABS)[number]["id"];

export function GuidePanel({
    active,
    onChange,
}: {
    active: GuideTabId;
    onChange: (id: GuideTabId) => void;
}) {
    return (
        <div className="trip-panel-enter space-y-5">
            <PanelHeader title="Guide" description="Day trips, extras, and game night details." />

            <div
                className="flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1 ring-1 ring-[var(--trip-separator)] ring-inset scrollbar-hide"
                role="tablist"
                aria-label="Guide sections"
            >
                {GUIDE_TABS.map(({ id, label, icon: Icon }) => (
                    <GuideSubTab key={id} id={id} label={label} icon={Icon} active={active} onChange={onChange} />
                ))}
            </div>

            {active === "activities" && <ActivitiesReferencePanel embedded />}
            {active === "gems" && <GemsReferencePanel embedded />}
            {active === "game" && <GameNightReferencePanel embedded />}
        </div>
    );
}

function GuideSubTab({
    id,
    label,
    icon: Icon,
    active,
    onChange,
}: {
    id: GuideTabId;
    label: string;
    icon: ComponentType<{ className?: string }>;
    active: GuideTabId;
    onChange: (id: GuideTabId) => void;
}) {
    return (
        <button
            type="button"
            role="tab"
            data-active={active === id}
            aria-selected={active === id}
            className="trip-coordinate-tab"
            onClick={() => onChange(id)}
        >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
        </button>
    );
}
