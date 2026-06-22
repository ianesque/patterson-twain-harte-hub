import { useCallback, useEffect, useState } from "react";
import { BUILD_ID, fetchRemoteBuildId } from "@/lib/build-version";

const POLL_MS = 5 * 60 * 1000;

export function useVersionCheck() {
    const [updateAvailable, setUpdateAvailable] = useState(false);

    const checkForUpdate = useCallback(async () => {
        if (import.meta.env.DEV) return;

        const remoteBuildId = await fetchRemoteBuildId();
        if (remoteBuildId && remoteBuildId !== BUILD_ID) {
            setUpdateAvailable(true);
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) return;

        void checkForUpdate();

        const onVisible = () => {
            if (document.visibilityState === "visible") void checkForUpdate();
        };

        document.addEventListener("visibilitychange", onVisible);
        const interval = window.setInterval(() => void checkForUpdate(), POLL_MS);

        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            window.clearInterval(interval);
        };
    }, [checkForUpdate]);

    const refresh = useCallback(() => {
        window.location.reload();
    }, []);

    return { updateAvailable, refresh };
}
