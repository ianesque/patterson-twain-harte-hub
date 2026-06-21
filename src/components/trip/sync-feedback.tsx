import { useEffect, useState } from "react";
import { XClose } from "@untitledui/icons";
import { isSupabaseConfigured } from "@/lib/supabase";

const SYNC_TIP_KEY = "twain_harte_sync_tip_dismissed";

export function SyncTipBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured) return;
        if (sessionStorage.getItem(SYNC_TIP_KEY)) return;
        setVisible(true);
    }, []);

    if (!visible) return null;

    function dismiss() {
        sessionStorage.setItem(SYNC_TIP_KEY, "1");
        setVisible(false);
    }

    return (
        <div className="trip-sync-tip" role="status">
            <p className="trip-sync-tip-text">Changes save automatically and sync live for the whole family.</p>
            <button type="button" className="trip-sync-tip-dismiss" aria-label="Dismiss" onClick={dismiss}>
                <XClose aria-hidden />
            </button>
        </div>
    );
}

export function SavedToast({ visible, live }: { visible: boolean; live?: boolean }) {
    if (!visible) return null;

    return (
        <div className="trip-saved-toast" role="status" aria-live="polite">
            {live === false ? "Saved on this device" : "Saved · live for family"}
        </div>
    );
}
