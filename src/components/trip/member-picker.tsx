import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { getHouseholdAccent, householdInitials } from "@/components/trip/trip-ui";
import { DEFAULT_PLANNER_SUGGESTIONS } from "@/lib/types";
import { useTrip } from "@/providers/trip-provider";

export function MemberPicker() {
    const { setMemberName } = useTrip();
    const [name, setName] = useState("");
    const [custom, setCustom] = useState(false);

    function choose(selected: string) {
        setMemberName(selected.trim());
    }

    return (
        <div className="trip-surface flex min-h-dvh flex-col">
            <div className="trip-hero px-4 py-10 text-center sm:px-6">
                <p className="trip-hero-label">Patterson reunion</p>
                <h1 className="trip-hero-title mt-2">Twain Harte</h1>
                <p className="trip-hero-dates mt-1">Jun 23–27, 2026</p>
                <p className="trip-hero-context mx-auto mt-3">Pick your household</p>
                <p className="trip-hero-meta mx-auto mt-2 max-w-sm">So everyone knows who updated what.</p>
            </div>

            <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:px-6 trip-panel-enter">
                <div className="grid gap-2.5">
                    {DEFAULT_PLANNER_SUGGESTIONS.map((household) => (
                        <button
                            key={household}
                            type="button"
                            onClick={() => choose(household)}
                            className="trip-planner-card group flex items-center gap-3.5 px-4 py-3.5 text-left active:opacity-90"
                        >
                            <span
                                className="flex size-11 shrink-0 items-center justify-center rounded-full text-base font-bold"
                                style={{
                                    backgroundColor: `${getHouseholdAccent(household)}22`,
                                    color: getHouseholdAccent(household),
                                }}
                                aria-hidden
                            >
                                {householdInitials(household)}
                            </span>
                            <span className="text-[var(--trip-body)] font-semibold tracking-tight text-primary">{household}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 border-t border-[var(--trip-separator)] pt-6">
                    {!custom ? (
                        <Button color="link-color" size="md" className="text-[var(--trip-body-sm)]" onClick={() => setCustom(true)}>
                            Use a different name
                        </Button>
                    ) : (
                        <form
                            className="trip-card flex flex-col gap-4 p-4 sm:flex-row sm:items-end"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (name.trim()) choose(name);
                            }}
                        >
                            <Input
                                label="Name"
                                value={name}
                                onChange={setName}
                                placeholder="Your name"
                                className="flex-1"
                            />
                            <Button type="submit" color="primary" size="lg" className="min-h-[3rem] sm:shrink-0" isDisabled={!name.trim()}>
                                Continue
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
