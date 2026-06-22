export function SavedToast({ visible, live }: { visible: boolean; live?: boolean }) {
    if (!visible) return null;

    return (
        <div className="trip-saved-toast" role="status" aria-live="polite">
            {live === false ? "Saved on this device" : "Saved · live for family"}
        </div>
    );
}
