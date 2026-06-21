import { useEffect, useState } from "react";
import { Lock01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
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
            setError(`Wrong password. ${after.attemptsRemaining} attempt${after.attemptsRemaining === 1 ? "" : "s"} remaining.`);
        }
        setPassword("");
    }

    const locked = rateLimit.locked;

    return (
        <div className="trip-surface flex min-h-dvh flex-col">
            <div className="trip-hero px-4 py-10 text-center sm:px-6">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[var(--trip-accent-soft)]">
                    <Lock01 className="size-8 text-[var(--trip-accent)]" />
                </div>
                <h1 className="trip-hero-title mt-5">Trip hub</h1>
                <p className="trip-hero-meta mt-2">Twain Harte · Jun 23–27, 2026</p>
            </div>

            <div className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-6">
                <div className="trip-card p-6 sm:p-8">
                    {locked && (
                        <div
                            className="mb-6 rounded-xl border border-[var(--trip-separator)] bg-secondary px-4 py-3 text-[var(--trip-body-sm)] text-secondary"
                            role="alert"
                        >
                            Sign-in paused for {formatRetryAfter(rateLimit.retryAfterMs)}.
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            placeholder="Password"
                            isRequired
                            isDisabled={locked}
                        />
                        {error && (
                            <p className="text-[var(--trip-body-sm)] text-error-primary" role="alert">
                                {error}
                            </p>
                        )}
                        {!locked &&
                            rateLimit.attemptsRemaining < MAX_ATTEMPTS_BEFORE_LOCKOUT &&
                            rateLimit.attemptsRemaining > 0 &&
                            !error && (
                                <p className="text-[var(--trip-caption)] text-quaternary">
                                    {rateLimit.attemptsRemaining} attempts before lockout
                                </p>
                            )}
                        <Button type="submit" color="primary" size="lg" className="min-h-[3rem] w-full text-base" isDisabled={loading || !password || locked}>
                            {loading ? "Checking…" : locked ? "Try again later" : "Continue"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-[var(--trip-caption)] leading-relaxed text-quaternary">Family only.</p>
                </div>
            </div>
        </div>
    );
}
