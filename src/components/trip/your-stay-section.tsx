import { useState } from "react";
import { AlertTriangle, ChevronDown, HomeLine, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { HouseholdInitials } from "@/components/trip/household-initials";
import { ROOM_LOCATION_LABELS, TRIP_ROOMS, type RoomLocation, type TripRoom } from "@/data/trip-content";
import {
    assigneeHouseholds,
    formatRoomDestination,
    getClaimableRooms,
    getClaimedHousehold,
    getResolvedAssignees,
    getYourRoomSummaryLabels,
    getYourSleepingPlan,
    isRoomOpen,
    roomMatchesHousehold,
} from "@/lib/rooms";
import { useTrip } from "@/providers/trip-provider";
import { cx } from "@/utils/cx";

const ALL_ROOMS_EXPANDED_KEY = "twain_harte_all_rooms_expanded";
const ROOMS_DISMISSED_KEY = "twain_harte_rooms_dismissed";

function readRoomsDismissed(): boolean {
    try {
        return localStorage.getItem(ROOMS_DISMISSED_KEY) === "true";
    } catch {
        return false;
    }
}

function AssigneeList({
    assignees,
    memberName,
}: {
    assignees: ReturnType<typeof getResolvedAssignees>;
    memberName: string | null;
}) {
    if (assignees.length === 0) {
        return <p className="trip-stay-room-empty">Open</p>;
    }

    return (
        <ul className="trip-stay-assignee-list">
            {assignees.map((assignee, index) => {
                if (assignee.type === "household") {
                    const isYou = assignee.household === memberName;
                    return (
                        <li key={`${assignee.household}-${index}`} className="trip-stay-assignee" data-you={isYou}>
                            <HouseholdInitials householdName={assignee.household} size="xs" />
                            <span>{isYou ? "You" : assignee.household}</span>
                        </li>
                    );
                }

                const isYourHousehold = assignee.household === memberName;
                return (
                    <li key={`${assignee.name}-${index}`} className="trip-stay-assignee" data-you={isYourHousehold}>
                        <HouseholdInitials householdName={assignee.household} size="xs" />
                        <span>
                            {assignee.name}
                            {assignee.note ? ` · ${assignee.note}` : ""}
                            {isYourHousehold ? " (your household)" : ""}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

function RoomCard({
    room,
    memberName,
    roomAssignments,
    onClaim,
}: {
    room: TripRoom;
    memberName: string;
    roomAssignments: Record<string, string>;
    onClaim: (roomId: string) => void;
}) {
    const claimed = getClaimedHousehold(room, roomAssignments);
    const assignees = getResolvedAssignees(room, roomAssignments);
    const open = isRoomOpen(room, roomAssignments);
    const isYours = roomMatchesHousehold(room, memberName, roomAssignments);
    const canClaim = room.claimableBy?.includes(memberName) && !claimed;

    return (
        <article className={cx("trip-card trip-stay-room-card", isYours && "trip-stay-room-card--yours")}>
            <header className="trip-stay-room-header">
                <h3 className="trip-stay-room-name">{room.name}</h3>
                {isYours && <span className="trip-stay-room-yours-badge">Your room</span>}
            </header>

            {open && room.claimableBy ? (
                <div className="trip-stay-room-open">
                    <p className="trip-stay-room-open-label">
                        Open — {room.claimableBy.map((h) => (h === memberName ? "you" : h)).join(" or ")}
                    </p>
                    {canClaim && (
                        <Button color="secondary" size="sm" onClick={() => onClaim(room.id)}>
                            Claim this room
                        </Button>
                    )}
                </div>
            ) : (
                <AssigneeList assignees={assignees} memberName={memberName} />
            )}

            {!open && assigneeHouseholds(assignees).length > 1 && (
                <p className="trip-stay-room-shared">Shared across households</p>
            )}
        </article>
    );
}

function LocationGroup({
    location,
    rooms,
    memberName,
    roomAssignments,
    onClaim,
}: {
    location: RoomLocation;
    rooms: TripRoom[];
    memberName: string;
    roomAssignments: Record<string, string>;
    onClaim: (roomId: string) => void;
}) {
    const visible = rooms.filter((room) => !room.offLimits);
    if (visible.length === 0) return null;

    return (
        <div className="trip-rsvp-day-group">
            <header className="trip-rsvp-day-group-header">
                <span className="trip-rsvp-day-group-date">{ROOM_LOCATION_LABELS[location]}</span>
            </header>
            <div className="trip-stay-room-grid">
                {visible.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        memberName={memberName}
                        roomAssignments={roomAssignments}
                        onClaim={onClaim}
                    />
                ))}
            </div>
        </div>
    );
}

function SleepingPlanCard({
    memberName,
    roomAssignments,
}: {
    memberName: string;
    roomAssignments: Record<string, string>;
}) {
    const sleepingPlan = getYourSleepingPlan(memberName, roomAssignments);
    const roomSummary = getYourRoomSummaryLabels(memberName, roomAssignments);

    if (sleepingPlan.length === 0) {
        return (
            <article className="trip-sleeping-plan-card">
                <div className="trip-sleeping-plan-header">
                    <HouseholdInitials householdName={memberName} size="md" />
                    <div className="min-w-0">
                        <p className="trip-sleeping-plan-kicker">{memberName}</p>
                        <p className="trip-sleeping-plan-answer">No room assignments yet for your household.</p>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="trip-sleeping-plan-card">
            <div className="trip-sleeping-plan-header">
                <HouseholdInitials householdName={memberName} size="md" />
                <div className="min-w-0">
                    <p className="trip-sleeping-plan-kicker">{memberName}</p>
                    <p className="trip-sleeping-plan-answer">
                        You&apos;re in:{" "}
                        <span className="trip-sleeping-plan-rooms">{roomSummary.join(", ")}</span>
                    </p>
                </div>
            </div>

            <ul className="trip-sleeping-plan-list">
                {sleepingPlan.map(({ room, people }) => (
                    <li key={room.id} className="trip-sleeping-plan-row">
                        <span className="trip-sleeping-plan-people">{people.join(", ")}</span>
                        <span className="trip-sleeping-plan-arrow" aria-hidden>
                            →
                        </span>
                        <span className="trip-sleeping-plan-destination">{formatRoomDestination(room)}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}

function ClaimTbdSection({
    memberName,
    roomAssignments,
    onClaim,
}: {
    memberName: string;
    roomAssignments: Record<string, string>;
    onClaim: (roomId: string) => void;
}) {
    const claimable = getClaimableRooms(memberName, roomAssignments);
    if (claimable.length === 0) return null;

    const claimableNames = claimable.map((room) => room.name);

    return (
        <div className="trip-claim-tbd">
            <p className="trip-claim-tbd-label">Still open for you: {claimableNames.join(" or ")}</p>
            <div className="trip-claim-tbd-actions">
                {claimable.map((room) => (
                    <Button key={room.id} color="secondary" size="sm" onClick={() => onClaim(room.id)}>
                        Claim {room.name}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function OffLimitsCompact({ room }: { room: TripRoom }) {
    return (
        <p className="trip-stay-off-limits-compact" role="note">
            <AlertTriangle className="trip-stay-off-limits-compact-icon" aria-hidden />
            <span>
                <strong>{room.name}</strong> off limits — {room.offLimitsNote ?? "Do not enter."}
            </span>
        </p>
    );
}

export function YourStaySection() {
    const { memberName, state, setRoomAssignment } = useTrip();
    const [allRoomsExpanded, setAllRoomsExpanded] = useState(
        () => sessionStorage.getItem(ALL_ROOMS_EXPANDED_KEY) === "true",
    );

    if (!memberName) return null;

    const roomAssignments = state.roomAssignments ?? {};
    const offLimitsRoom = TRIP_ROOMS.find((room) => room.offLimits);
    const mainHouseRooms = TRIP_ROOMS.filter((room) => room.location === "main-house");
    const barnRooms = TRIP_ROOMS.filter((room) => room.location === "barn");

    function claimRoom(roomId: string) {
        setRoomAssignment(roomId, memberName);
    }

    function toggleAllRooms() {
        setAllRoomsExpanded((open) => {
            const next = !open;
            sessionStorage.setItem(ALL_ROOMS_EXPANDED_KEY, next ? "true" : "false");
            return next;
        });
    }

    return (
        <div className="trip-stay-content space-y-4">
            <SleepingPlanCard memberName={memberName} roomAssignments={roomAssignments} />

            <ClaimTbdSection memberName={memberName} roomAssignments={roomAssignments} onClaim={claimRoom} />

            {offLimitsRoom && <OffLimitsCompact room={offLimitsRoom} />}

            <section className="trip-all-rooms">
                <button
                    type="button"
                    className="trip-all-rooms-toggle"
                    aria-expanded={allRoomsExpanded}
                    onClick={toggleAllRooms}
                >
                    <span className="trip-all-rooms-title">All rooms</span>
                    <ChevronDown
                        className={cx("trip-all-rooms-chevron", allRoomsExpanded && "trip-all-rooms-chevron--open")}
                        aria-hidden
                    />
                </button>

                {allRoomsExpanded && (
                    <div className="trip-all-rooms-body">
                        <LocationGroup
                            location="main-house"
                            rooms={mainHouseRooms}
                            memberName={memberName}
                            roomAssignments={roomAssignments}
                            onClaim={claimRoom}
                        />

                        <LocationGroup
                            location="barn"
                            rooms={barnRooms}
                            memberName={memberName}
                            roomAssignments={roomAssignments}
                            onClaim={claimRoom}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

export function DismissableRoomsSection() {
    const { memberName } = useTrip();
    const [dismissed, setDismissed] = useState(() => readRoomsDismissed());

    if (!memberName) return null;

    function dismiss() {
        try {
            localStorage.setItem(ROOMS_DISMISSED_KEY, "true");
        } catch {
            /* storage unavailable */
        }
        setDismissed(true);
    }

    function show() {
        try {
            localStorage.removeItem(ROOMS_DISMISSED_KEY);
        } catch {
            /* storage unavailable */
        }
        setDismissed(false);
    }

    if (dismissed) {
        return (
            <p className="trip-plan-rooms-reveal">
                <button type="button" className="trip-plan-rooms-reveal-link" onClick={show}>
                    <HomeLine className="trip-plan-rooms-reveal-icon" aria-hidden />
                    Show sleeping plan
                </button>
            </p>
        );
    }

    return (
        <section className="trip-plan-rooms-banner" aria-label="Your sleeping plan">
            <header className="trip-plan-rooms-banner-header">
                <div className="trip-plan-rooms-banner-title">
                    <span className="trip-plan-rooms-banner-icon-wrap" aria-hidden>
                        <HomeLine className="trip-plan-rooms-banner-icon" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="trip-plan-rooms-banner-heading">Your sleeping plan</h2>
                        <p className="trip-plan-rooms-banner-desc">Where you and your household are staying</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="trip-icon-btn trip-plan-rooms-dismiss"
                    onClick={dismiss}
                    aria-label="Dismiss sleeping plan"
                >
                    <XClose aria-hidden />
                </button>
            </header>

            <div className="trip-plan-rooms-banner-body">
                <YourStaySection />
            </div>

            <footer className="trip-plan-rooms-banner-footer">
                <Button color="secondary" size="sm" onClick={dismiss}>
                    Got it
                </Button>
            </footer>
        </section>
    );
}
