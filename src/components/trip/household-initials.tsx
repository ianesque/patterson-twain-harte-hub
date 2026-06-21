import { getHouseholdAccent, householdInitials } from "@/components/trip/trip-ui";
import { cx } from "@/utils/cx";

export type HouseholdInitialsSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<HouseholdInitialsSize, string> = {
    xs: "trip-household-initials--xs",
    sm: "trip-household-initials--sm",
    md: "trip-household-initials--md",
    lg: "trip-household-initials--lg",
    xl: "trip-household-initials--xl",
};

export function HouseholdInitials({
    householdName,
    size = "sm",
    className,
}: {
    householdName: string;
    size?: HouseholdInitialsSize;
    className?: string;
}) {
    const accent = getHouseholdAccent(householdName);

    return (
        <span
            className={cx("trip-household-initials", sizeClasses[size], className)}
            style={{ backgroundColor: `${accent}22`, color: accent }}
            aria-hidden
        >
            {householdInitials(householdName)}
        </span>
    );
}
