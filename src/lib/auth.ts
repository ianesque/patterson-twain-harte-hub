const AUTH_SESSION_KEY = "twain_harte_auth";
const MEMBER_KEY = "twain_harte_member";
const RATE_LIMIT_KEY = "twain_harte_auth_rate";

/** Failed attempts allowed before lockout kicks in. */
const MAX_ATTEMPTS = 5;
/** Base lockout duration; doubles with each consecutive lockout (capped). */
const BASE_LOCKOUT_MS = 30_000;
const MAX_LOCKOUT_MS = 15 * 60 * 1000;

interface RateLimitState {
    failures: number;
    lockedUntil: number | null;
    lockoutCount: number;
}

function readRateLimit(): RateLimitState {
    try {
        const raw = localStorage.getItem(RATE_LIMIT_KEY);
        if (raw) return JSON.parse(raw) as RateLimitState;
    } catch {
        /* ignore */
    }
    return { failures: 0, lockedUntil: null, lockoutCount: 0 };
}

function writeRateLimit(state: RateLimitState): void {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
}

export interface RateLimitStatus {
    locked: boolean;
    retryAfterMs: number;
    attemptsRemaining: number;
}

export function getRateLimitStatus(): RateLimitStatus {
    const state = readRateLimit();
    const now = Date.now();

    if (state.lockedUntil && now < state.lockedUntil) {
        return {
            locked: true,
            retryAfterMs: state.lockedUntil - now,
            attemptsRemaining: 0,
        };
    }

    if (state.lockedUntil && now >= state.lockedUntil) {
        writeRateLimit({ ...state, lockedUntil: null });
    }

    return {
        locked: false,
        retryAfterMs: 0,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - state.failures),
    };
}

export function recordFailedAttempt(): RateLimitStatus {
    const state = readRateLimit();
    const failures = state.failures + 1;

    if (failures >= MAX_ATTEMPTS) {
        const lockoutCount = state.lockoutCount + 1;
        const duration = Math.min(BASE_LOCKOUT_MS * 2 ** (lockoutCount - 1), MAX_LOCKOUT_MS);
        const lockedUntil = Date.now() + duration;
        writeRateLimit({ failures: 0, lockedUntil, lockoutCount });
        return { locked: true, retryAfterMs: duration, attemptsRemaining: 0 };
    }

    writeRateLimit({ ...state, failures });
    return getRateLimitStatus();
}

export function clearRateLimit(): void {
    localStorage.removeItem(RATE_LIMIT_KEY);
}

export async function hashPassword(password: string): Promise<string> {
    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function isAuthenticated(): boolean {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
}

export function setAuthenticated(): void {
    sessionStorage.setItem(AUTH_SESSION_KEY, "1");
    clearRateLimit();
}

export function clearAuthentication(): void {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export async function verifyPassword(password: string): Promise<"ok" | "wrong" | "locked"> {
    const limit = getRateLimitStatus();
    if (limit.locked) return "locked";

    const expected = import.meta.env.VITE_SITE_PASSWORD_HASH;
    let ok: boolean;
    if (!expected) {
        ok = password === "patterson2026";
    } else {
        const hash = await hashPassword(password);
        ok = hash === expected;
    }

    if (ok) {
        clearRateLimit();
        return "ok";
    }

    recordFailedAttempt();
    return "wrong";
}

export function getStoredMember(): string | null {
    return localStorage.getItem(MEMBER_KEY);
}

export function setStoredMember(name: string): void {
    localStorage.setItem(MEMBER_KEY, name);
}

export function clearStoredMember(): void {
    localStorage.removeItem(MEMBER_KEY);
}

export function formatRetryAfter(ms: number): string {
    const totalSec = Math.ceil(ms / 1000);
    if (totalSec >= 60) {
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
    }
    return `${totalSec}s`;
}
