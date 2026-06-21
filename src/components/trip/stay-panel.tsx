import { useState } from "react";
import { AlertTriangle, ChevronDown } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { HouseholdInitials } from "@/components/trip/household-initials";
import { PanelHeader } from "@/components/trip/trip-ui";
import { ROOM_LOCATION_LABELS, TRIP_ROOMS, type RoomLocation, type TripRoom } from "@/data/trip-content";
import {
    assigneeHouseholds,
    formatRoommates,
    getClaimableRooms,
    getClaimedHousehold,
    getResolvedAssignees,
    getYourRooms,
    isRoomOpen,
    locationLabel,
    roomMatchesHousehold,
} from "@/lib/rooms";
import { useTrip } from "@/providers/trip-provider";
import { cx } from "@/utils/cx";

function YourRoomsSection({
    memberName,
    roomAssignments,
    onClaim,
}: {
    memberName: string;
    roomAssignments: Record<string, string>;
    onClaim: (roomId: string) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const yourRooms = getYourRooms(memberName, roomAssignments);
    const claimable = getClaimableRooms(memberName, roomAssignments);

    if (yourRooms.length === 0 && claimable.length === 0) return null;

    const claimableNames = claimable.map((room) => room.name);

    return (
        <section className="trip-your-rooms">
            <button
                type="button"
                className="trip-your-rooms-toggle"
                aria-expanded={expanded}
                onClick={() => setExpanded((open) => !open)}
            >
                <span className="trip-your-rooms-title">Your rooms</span>
                <ChevronDown className={cx("trip-your-rooms-chevron", expanded && "trip-your-rooms-chevron--open")} aria-hidden />
            </button>

            {expanded && (
                <div className="trip-your-rooms-body">
                    {yourRooms.map((room) => (
                        <YourRoomCard key={room.id} room={room} memberName={memberName} roomAssignments={roomAssignments} />
                    ))}

                    {claimable.length > 0 && (
                        <div className="trip-your-rooms-tbd">
                            <p className="trip-your-rooms-tbd-label">
                                You could take: {claimableNames.join(" OR ")}
                            </p>
                            <div className="trip-your-rooms-claim-row">
                                {claimable.map((room) => (
                                    <Button
                                        key={room.id}
                                        color="secondary"
                                        size="sm"
                                        onClick={() => onClaim(room.id)}
                                    >
                                        Claim {room.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

function YourRoomCard({
    room,
    memberName,
    roomAssignments,
}: {
    room: TripRoom;
    memberName: string;
    roomAssignments: Record<string, string>;
}) {
    const roommates = formatRoommates(room, memberName, roomAssignments);

    return (
        <article className="trip-your-room-card">
            <div className="trip-your-room-card-top">
                <h3 className="trip-your-room-name">{room.name}</h3>
                <span className="trip-your-room-location">{locationLabel(room.location)}</span>
            </div>
            <p className="trip-your-room-roommates">With {roommates}</p>
        </article>
    );
}

function OffLimitsCallout({ room }: { room: TripRoom }) {
    return (
        <div className="trip-stay-off-limits" role="note">
            <AlertTriangle className="trip-stay-off-limits-icon" aria-hidden />
            <div>
                <p className="trip-stay-off-limits-title">{room.name}</p>
                <p className="trip-stay-off-limits-body">{room.offLimitsNote ?? "Off limits."}</p>
            </div>
        </div>
    );
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

export function StayPanel() {
    const { memberName, state, setRoomAssignment } = useTrip();

    if (!memberName) return null;

    const roomAssignments = state.roomAssignments ?? {};
    const offLimitsRoom = TRIP_ROOMS.find((room) => room.offLimits);
    const mainHouseRooms = TRIP_ROOMS.filter((room) => room.location === "main-house");
    const barnRooms = TRIP_ROOMS.filter((room) => room.location === "barn");

    function claimRoom(roomId: string) {
        setRoomAssignment(roomId, memberName);
    }

    return (
        <div className="space-y-6">
            <PanelHeader title="Stay" description="Where everyone is sleeping." />

            <YourRoomsSection memberName={memberName} roomAssignments={roomAssignments} onClaim={claimRoom} />

            {offLimitsRoom && <OffLimitsCallout room={offLimitsRoom} />}

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
    );
}
