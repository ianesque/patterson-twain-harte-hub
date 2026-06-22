import { ROOM_LOCATION_LABELS, TRIP_ROOMS, type RoomAssignee, type TripRoom } from "@/data/trip-content";

export function getClaimedHousehold(room: TripRoom, roomAssignments: Record<string, string>): string | null {
    return roomAssignments[room.id] ?? null;
}

export function getResolvedAssignees(room: TripRoom, roomAssignments: Record<string, string>): RoomAssignee[] {
    const claimed = getClaimedHousehold(room, roomAssignments);
    if (claimed) {
        return [{ type: "household", household: claimed }];
    }
    return room.assignees;
}

export function isRoomOpen(room: TripRoom, roomAssignments: Record<string, string>): boolean {
    if (room.offLimits) return false;
    if (room.claimableBy?.length) return !getClaimedHousehold(room, roomAssignments);
    return getResolvedAssignees(room, roomAssignments).length === 0;
}

export function assigneeHouseholds(assignees: RoomAssignee[]): string[] {
    const households = new Set<string>();
    for (const assignee of assignees) {
        if (assignee.type === "household") households.add(assignee.household);
        else households.add(assignee.household);
    }
    return [...households];
}

export function roomMatchesHousehold(
    room: TripRoom,
    memberName: string,
    roomAssignments: Record<string, string>,
): boolean {
    const claimed = getClaimedHousehold(room, roomAssignments);
    if (claimed === memberName) return true;

    const assignees = getResolvedAssignees(room, roomAssignments);
    return assignees.some((assignee) => {
        if (assignee.type === "household") return assignee.household === memberName;
        return assignee.household === memberName;
    });
}

export function getYourRooms(memberName: string, roomAssignments: Record<string, string>): TripRoom[] {
    return TRIP_ROOMS.filter((room) => !room.offLimits && roomMatchesHousehold(room, memberName, roomAssignments));
}

/** Unclaimed TBD rooms this household could still claim */
export function getClaimableRooms(memberName: string, roomAssignments: Record<string, string>): TripRoom[] {
    return TRIP_ROOMS.filter(
        (room) =>
            room.claimableBy?.includes(memberName) &&
            !getClaimedHousehold(room, roomAssignments) &&
            !roomMatchesHousehold(room, memberName, roomAssignments),
    );
}

export function formatRoommates(
    room: TripRoom,
    memberName: string,
    roomAssignments: Record<string, string>,
): string {
    const claimed = getClaimedHousehold(room, roomAssignments);
    if (claimed === memberName) return "Just your household";

    const assignees = getResolvedAssignees(room, roomAssignments);
    const labels: string[] = [];

    for (const assignee of assignees) {
        if (assignee.type === "household") {
            if (assignee.household !== memberName) labels.push(assignee.household);
            continue;
        }
        labels.push(assignee.note ? `${assignee.name} (${assignee.note})` : assignee.name);
    }

    const unique = [...new Set(labels)];
    if (unique.length === 0) return "Just your household";
    return unique.join(", ");
}

export function locationLabel(location: TripRoom["location"]): string {
    return ROOM_LOCATION_LABELS[location];
}

export type SleepingPlanRow = {
    room: TripRoom;
    people: string[];
};

/** People in the signed-in household → room, grouped by room */
export function getYourSleepingPlan(memberName: string, roomAssignments: Record<string, string>): SleepingPlanRow[] {
    const rows: SleepingPlanRow[] = [];

    for (const room of TRIP_ROOMS) {
        if (room.offLimits) continue;
        if (!roomMatchesHousehold(room, memberName, roomAssignments)) continue;

        const assignees = getResolvedAssignees(room, roomAssignments);
        const people: string[] = [];

        for (const assignee of assignees) {
            if (assignee.type === "household" && assignee.household === memberName) {
                people.push(assignee.household);
            } else if (assignee.type === "person" && assignee.household === memberName) {
                people.push(assignee.note ? `${assignee.name} (${assignee.note})` : assignee.name);
            }
        }

        const claimed = getClaimedHousehold(room, roomAssignments);
        if (claimed === memberName && people.length === 0) {
            people.push(memberName);
        }

        if (people.length > 0) {
            rows.push({ room, people });
        }
    }

    return rows;
}

/** Short room labels for the "You're in:" summary — disambiguates duplicate names */
export function getYourRoomSummaryLabels(memberName: string, roomAssignments: Record<string, string>): string[] {
    const rooms = getYourRooms(memberName, roomAssignments);
    const nameCounts = new Map<string, number>();

    for (const room of rooms) {
        nameCounts.set(room.name, (nameCounts.get(room.name) ?? 0) + 1);
    }

    return rooms.map((room) => {
        if ((nameCounts.get(room.name) ?? 0) > 1) {
            return `${room.name} (${locationLabel(room.location)})`;
        }
        return room.name;
    });
}

export function formatRoomDestination(room: TripRoom): string {
    return `${room.name} · ${locationLabel(room.location)}`;
}
