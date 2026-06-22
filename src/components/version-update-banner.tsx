import { useState } from "react";
import { RefreshCcw01, XClose } from "@untitledui/icons";
import { useVersionCheck } from "@/hooks/use-version-check";

export function VersionUpdateBanner() {
    const { updateAvailable, refresh } = useVersionCheck();
    const [dismissed, setDismissed] = useState(false);

    if (!updateAvailable || dismissed) return null;

    return (
        <div className="trip-version-banner" role="status">
            <p className="trip-version-banner-text">A new version of the trip hub is available.</p>
            <div className="trip-version-banner-actions">
                <button type="button" className="trip-version-banner-refresh" onClick={refresh}>
                    <RefreshCcw01 aria-hidden />
                    Refresh
                </button>
                <button
                    type="button"
                    className="trip-version-banner-dismiss"
                    aria-label="Dismiss for now"
                    onClick={() => setDismissed(true)}
                >
                    <XClose aria-hidden />
                </button>
            </div>
        </div>
    );
}
