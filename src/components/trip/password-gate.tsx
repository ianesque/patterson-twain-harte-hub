import { useEffect, useState } from "react";
import { Lock01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import {
    formatRetryAfter,
    getRateLimitStatus,
    setAuthenticated,
    verifyPassword,
} from "@/lib/auth";

const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;

interface PasswordGateProps {
    onSuccess: () => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rateLimit, setRateLimit] = useState(getRateLimitStatus);

    useEffect(() => {
        if (!rateLimit.locked) return;
        const tick = () => setRateLimit(getRateLimitStatus());
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [rateLimit.locked]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const current = getRateLimitStatus();
        if (current.locked) {
            setRateLimit(current);
            return;
        }

        setLoading(true);
        setError("");
        const result = await verifyPassword(password);
        setLoading(false);
        setRateLimit(getRateLimitStatus());

        if (result === "ok") {
            setAuthenticated();
            onSuccess();
            return;
        }

        if (result === "locked") {
            setError(`Too many attempts. Try again in ${formatRetryAfter(getRateLimitStatus().retryAfterMs)}.`);
            return;
        }

        const after = getRateLimitStatus();
        if (after.locked) {
            setError(`Too many attempts. Try again in ${formatRetryAfter(after.retryAfterMs)}.`);
        } else {
            setError(
                `Wrong password — ask a Patterson planner for access. ${after.attemptsRemaining} attempt${after.attemptsRemaining === 1 ? "" : "s"} remaining.`,
            );
        }
        setPassword("");
    }

    const locked = rateLimit.locked;

    return (
        <div className="flex min-h-dvh items-center justify-center bg-primary px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-secondary bg-primary p-6 shadow-lg ring-1 ring-secondary ring-inset sm:p-8">
                <div className="flex flex-col items-center text-center">
                    <FeaturedIcon icon={Lock01} color="brand" theme="modern" size="lg" />
                    <h1 className="mt-4 text-display-xs font-semibold text-primary">Patterson Trip Hub</h1>
                    <p className="mt-2 text-sm text-tertiary">Twain Harte · Jun 23–27, 2026 · family only</p>
                </div>

                {locked && (
                    <div
                        className="mt-6 rounded-xl border border-utility-error-200 bg-utility-error-50 px-3 py-2.5 text-sm text-utility-error-800"
                        role="alert"
                    >
                        Sign-in paused for {formatRetryAfter(rateLimit.retryAfterMs)} after too many failed attempts.
                    </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <Input
                        label="Family password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter password"
                        isRequired
                        isDisabled={locked}
                    />
                    {error && (
                        <p className="text-sm text-error-primary" role="alert">
                            {error}
                        </p>
                    )}
                    {!locked && rateLimit.attemptsRemaining < MAX_ATTEMPTS_BEFORE_LOCKOUT && rateLimit.attemptsRemaining > 0 && !error && (
                        <p className="text-xs text-quaternary">{rateLimit.attemptsRemaining} attempts remaining before lockout.</p>
                    )}
                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        className="w-full"
                        isDisabled={loading || !password || locked}
                    >
                        {loading ? "Checking…" : locked ? "Try again later" : "Enter trip hub"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-xs text-quaternary">
                    Shared planning for adult coordinators. Changes sync live when Supabase is configured.
                </p>
            </div>
        </div>
    );
}
