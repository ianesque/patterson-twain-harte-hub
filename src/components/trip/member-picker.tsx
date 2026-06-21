import { useState } from "react";
import { User01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
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
        <div className="flex min-h-dvh items-center justify-center bg-primary px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl border border-secondary bg-primary p-6 shadow-lg ring-1 ring-secondary ring-inset sm:p-8">
                <div className="flex items-start gap-3">
                    <User01 className="mt-1 size-6 text-fg-brand-primary" />
                    <div>
                        <h1 className="text-display-xs font-semibold text-primary">Who&apos;s planning?</h1>
                        <p className="mt-1 text-sm text-tertiary">
                            Pick your household so edits show your name to the other adults. This stays on your device.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {DEFAULT_PLANNER_SUGGESTIONS.map((suggestion) => (
                        <Button key={suggestion} color="secondary" size="md" onClick={() => choose(suggestion)}>
                            {suggestion}
                        </Button>
                    ))}
                </div>

                <div className="mt-6 border-t border-secondary pt-6">
                    {!custom ? (
                        <Button color="link-color" size="md" onClick={() => setCustom(true)}>
                            Use a different name
                        </Button>
                    ) : (
                        <form
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (name.trim()) choose(name);
                            }}
                        >
                            <Input
                                label="Your name or household"
                                value={name}
                                onChange={setName}
                                placeholder="e.g. Jamie & Alex"
                                className="flex-1"
                            />
                            <Button type="submit" color="primary" size="lg" isDisabled={!name.trim()}>
                                Continue
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
