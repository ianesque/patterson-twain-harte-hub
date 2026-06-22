import type { DayId } from "@/lib/types";

export interface ItineraryRow {
    icon: string;
    title: string;
    body: string;
}

export interface DayPlan {
    id: DayId;
    weekday: string;
    dayNum: string;
    title: string;
    theme: string;
    tag: string;
    tagTone: "easy" | "mod" | "big";
    effortAccess: string;
    rows: ItineraryRow[];
}

export interface ActivityOption {
    id: string;
    label: string;
    description: string;
}

export interface SplittableActivity {
    id: string;
    dayId: DayId;
    title: string;
    description: string;
    emoji: string;
    /** Shown as selected until the household taps to confirm or change */
    defaultOptionId: string;
    options: ActivityOption[];
}

export interface ActivityCard {
    title: string;
    distance: string;
    body: string;
    lines?: string[];
    phone?: string;
    badges: { label: string; tone: "sr" | "no" | "pay" | "free" }[];
}

export interface ChecklistDef {
    key: string;
    title: string;
    detail: string;
    phone?: string;
    priority: "now" | "soon" | "flex";
}

export const TRIP_META = {
    title: "Patterson Family Reunion · Twain Harte",
    subtitle: "Jun 23–27, 2026",
    dates: "Tue Jun 23 – Sat Jun 27, 2026",
    checkIn: "Tuesday 4:00 PM",
    address: "23135 South Fork Road, Twain Harte, CA 95383",
    mapsUrl: "https://maps.google.com/?q=23135+South+Fork+Road,+Twain+Harte,+CA+95383",
    pills: [] as string[],
};

export const MEALS_NOTE =
    "Breakfast and lunch are on your own. Gabe can eat with any family or from the fridge. Shared dinners Tue–Fri — Saturday is checkout and travel.";

export const DAYS: DayPlan[] = [
    {
        id: "tue-23",
        weekday: "TUE",
        dayNum: "23",
        title: "Arrive & settle in",
        theme: "Check-in 4 PM · pool · easy dinner",
        tag: "Arrival",
        tagTone: "easy",
        effortAccess: "Low-key at the house and pool. Village ice cream and shops are a ~5-minute drive (about 1.6 mi), not walkable from this address.",
        rows: [
            {
                icon: "🏠",
                title: "Check-in 4 PM",
                body: "",
            },
            {
                icon: "🏊",
                title: "Pool",
                body: "Unwind after the drive. Draft Game Night teams if kids are up for it.",
            },
            {
                icon: "🍦",
                title: "Welcome dinner",
                body: "At the house. For dessert, Harte Creamery is 5 min drive away.",
            },
        ],
    },
    {
        id: "wed-24",
        weekday: "WED",
        dayNum: "24",
        title: "Pinecrest Lake",
        theme: "Boat · beach · portraits tonight",
        tag: "All ages",
        tagTone: "easy",
        effortAccess: "Boat is seated and shaded. Beach is flat. Leave time to shower before portraits.",
        rows: [
            {
                icon: "⛵",
                title: "Party boat",
                body: "Book a 2-hour morning slot (before noon). Cooler + lunch on board. Two boats if needed for 20.",
            },
            {
                icon: "🏖️",
                title: "Pinecrest Non-Boater Activities",
                body: "Beach, kayaks, and lakeshore for anyone skipping the boat. Buoyed swim area — snack bar and restrooms on site.",
            },
            {
                icon: "⏰",
                title: "Home by mid-afternoon",
                body: "Shower and change before portraits.",
            },
            {
                icon: "📸",
                title: "Family portraits",
                body: "6:30 PM — Golden hour. Coordinate outfits ahead of time. Keep the rest of the evening light.",
            },
        ],
    },
    {
        id: "thu-25",
        weekday: "THU",
        dayNum: "25",
        title: "Fish & feed trout → Game Night",
        theme: "Hatchery · fishing · pool · Game Night",
        tag: "Easy day",
        tagTone: "easy",
        effortAccess: "Hatchery is flat and paved. Lyons has easy bank fishing. Game Night at the pool — not everyone has to get wet.",
        rows: [
            {
                icon: "🐟",
                title: "Fish hatchery",
                body: "Optional for whoever wants to go — bring quarters to feed trout. Open 7:30 AM–3:30 PM.",
            },
            {
                icon: "🎣",
                title: "Trout fishing",
                body: "Pinecrest, Lyons, or Beardsley. Ages 16+ need a CA license — buy online before you go.",
            },
            {
                icon: "🏊",
                title: "Pool afternoon",
                body: "Quiet time at base camp before Game Night tonight.",
            },
            {
                icon: "🎉",
                title: "Game Night",
                body: "Thursday at the pool. Wet relay + Family Feud — see the Guide tab for the plan.",
            },
        ],
    },
    {
        id: "fri-26",
        weekday: "FRI",
        dayNum: "26",
        title: "River day → movie night",
        theme: "Float or River Ranch · Movies Under the Stars",
        tag: "Pick your level",
        tagTone: "mod",
        effortAccess: "Knights Ferry is a long float — swimming required. River Ranch is closer and mellow. Bring layers for the outdoor movie.",
        rows: [
            {
                icon: "🌊",
                title: "Knights Ferry float",
                body: "7 miles, 3.5–5 hours. ~1 hour drive each way. For the able-bodied crew.",
            },
            {
                icon: "🏕️",
                title: "River Ranch",
                body: "~20 min. River swim, horseshoes, volleyball. Keeps the group closer.",
            },
            {
                icon: "🎬",
                title: "Movies Under the Stars",
                body: "The Mandalorian and Grogu at Pinecrest amphitheater, Friday ~8:30 PM. $10 tickets. Blankets, low chairs, jackets.",
            },
        ],
    },
    {
        id: "sat-27",
        weekday: "SAT",
        dayNum: "27",
        title: "Checkout & head home",
        theme: "Pack up · Columbia on the way",
        tag: "Flexible",
        tagTone: "easy",
        effortAccess: "Columbia State Historic Park is flat and walkable — ~30 min toward Sonora, easy to stop on the drive home.",
        rows: [
            {
                icon: "📦",
                title: "Checkout & pack up",
                body: "Leave in waves. Final pool dip if there's time.",
            },
            {
                icon: "🛍️",
                title: "Columbia on the way home",
                body: "Stop at Columbia State Historic Park on the drive toward Sonora — gold-rush town, shops, stagecoach, gold panning.",
            },
        ],
    },
];

/** Shared dinner planning — no Saturday (checkout / drive home) */
export const DINNER_DAYS = DAYS.filter((d) => d.id !== "sat-27");

export function dayShortLabel(dayId: DayId): string {
    const day = DAYS.find((d) => d.id === dayId);
    if (!day) return dayId;
    const wd = day.weekday.charAt(0) + day.weekday.slice(1).toLowerCase();
    return `${wd} ${day.dayNum}`;
}

export const SPLITTABLE_ACTIVITIES: SplittableActivity[] = [
    {
        id: "wed-boat",
        dayId: "wed-24",
        title: "Party boat",
        description: "2-hour morning slot on Pinecrest. Cooler + lunch on board.",
        emoji: "⛵",
        defaultOptionId: "boat",
        options: [{ id: "boat", label: "Party boat", description: "Book before noon · marina (209) 965-3333" }],
    },
    {
        id: "wed-beach",
        dayId: "wed-24",
        title: "Pinecrest Non-Boater Activities",
        description: "Beach, kayaks, and lakeshore for anyone skipping the boat.",
        emoji: "🏖️",
        defaultOptionId: "beach",
        options: [
            {
                id: "beach",
                label: "Pinecrest Non-Boater Activities",
                description: "Flat swim area · kayaks · good for little ones",
            },
        ],
    },
    {
        id: "wed-portraits",
        dayId: "wed-24",
        title: "Family portraits",
        description: "6:30 PM — Golden hour at the house. Shower and change after the lake.",
        emoji: "📸",
        defaultOptionId: "portraits",
        options: [{ id: "portraits", label: "Portraits", description: "6:30 PM · Coordinate outfits ahead of time" }],
    },
    {
        id: "thu-hatchery",
        dayId: "thu-25",
        title: "Fish hatchery",
        description: "Feed trout — bring quarters. Flat, paved, easy for all ages.",
        emoji: "🐟",
        defaultOptionId: "hatchery",
        options: [{ id: "hatchery", label: "Fish hatchery", description: "~40 min · 7:30 AM–3:30 PM" }],
    },
    {
        id: "thu-fishing",
        dayId: "thu-25",
        title: "Trout fishing",
        description: "Pinecrest, Lyons, or Beardsley. Ages 16+ need a license.",
        emoji: "🎣",
        defaultOptionId: "fishing",
        options: [{ id: "fishing", label: "Trout fishing", description: "Lyons is quiet bank fishing" }],
    },
    {
        id: "thu-pool",
        dayId: "thu-25",
        title: "Pool at the house",
        description: "Quiet afternoon at base camp while others are out.",
        emoji: "🏊",
        defaultOptionId: "pool-home",
        options: [{ id: "pool-home", label: "Pool at the house", description: "Afternoon at base camp" }],
    },
    {
        id: "thu-game-night",
        dayId: "thu-25",
        title: "Game Night",
        description: "Thursday at the pool. Wet relay + Family Feud — see Guide for the plan.",
        emoji: "🎉",
        defaultOptionId: "game-in",
        options: [{ id: "game-in", label: "Game Night", description: "At the pool · mix ages on each team" }],
    },
    {
        id: "thu-evening-home",
        dayId: "thu-25",
        title: "Stay at the house (evening)",
        description: "Quiet evening while others play at the pool for Game Night.",
        emoji: "🏠",
        defaultOptionId: "game-out",
        options: [{ id: "game-out", label: "Stay at the house", description: "Skip Game Night · early night" }],
    },
    {
        id: "fri-knights-ferry",
        dayId: "fri-26",
        title: "Knights Ferry float",
        description: "7 miles, 3.5–5 hours. Long drive — for the able-bodied crew.",
        emoji: "🌊",
        defaultOptionId: "knights-ferry",
        options: [
            {
                id: "knights-ferry",
                label: "Knights Ferry float",
                description: "7 mi · 3.5–5 hrs · ~1 hr drive each way",
            },
        ],
    },
    {
        id: "fri-river-ranch",
        dayId: "fri-26",
        title: "River Ranch",
        description: "River swim, horseshoes, volleyball — keeps the group closer.",
        emoji: "🏕️",
        defaultOptionId: "river-ranch",
        options: [{ id: "river-ranch", label: "River Ranch", description: "~20 min · mellow riverfront" }],
    },
    {
        id: "fri-pool",
        dayId: "fri-26",
        title: "Pool at the house (Friday)",
        description: "Pool day at base camp while others hit the river.",
        emoji: "🏊",
        defaultOptionId: "pool-home",
        options: [{ id: "pool-home", label: "Stay at the house", description: "Pool day at base camp" }],
    },
    {
        id: "fri-movie",
        dayId: "fri-26",
        title: "The Mandalorian and Grogu",
        description: "Movies Under the Stars at Pinecrest · Friday ~8:30 PM · $10 tickets. Bring layers.",
        emoji: "🎬",
        defaultOptionId: "movie-in",
        options: [
            {
                id: "movie-in",
                label: "The Mandalorian and Grogu",
                description: "Pinecrest amphitheater · $10 · blankets & jackets",
            },
        ],
    },
    {
        id: "fri-evening-home",
        dayId: "fri-26",
        title: "Stay at the house (evening)",
        description: "Pool time or early night while others catch the movie.",
        emoji: "🏠",
        defaultOptionId: "movie-out",
        options: [{ id: "movie-out", label: "Stay at the house", description: "Pool or early night" }],
    },
];

/** Stay-home / pool options — informational in Plan, not RSVP cards. */
const STAY_HOME_ACTIVITY_IDS = new Set(["thu-pool", "thu-evening-home", "fri-pool", "fri-evening-home"]);

export function isStayHomeActivity(activity: SplittableActivity): boolean {
    return STAY_HOME_ACTIVITY_IDS.has(activity.id);
}

/** Outings that appear on the Coordinate → Who's going tab. */
export const RSVP_ACTIVITIES = SPLITTABLE_ACTIVITIES.filter((activity) => !isStayHomeActivity(activity));

export const ACTIVITY_MENU: ActivityCard[] = [
    {
        title: "Pinecrest Lake",
        distance: "~30 min",
        body: "Party boats, kayaks, swim beach, 4-mile lakeshore loop.",
        lines: ["Book morning boat slots ahead. Marina 6 AM–8 PM.", "📞 (209) 965-3333"],
        badges: [
            { label: "Easy", tone: "sr" },
            { label: "Paid rentals", tone: "pay" },
        ],
    },
    {
        title: "Moccasin Creek Fish Hatchery",
        distance: "~40 min",
        body: "Feed trout (bring quarters). Flat, paved, restrooms.",
        lines: ["7:30 AM–3:30 PM · free"],
        badges: [
            { label: "Easy", tone: "sr" },
            { label: "Free", tone: "free" },
        ],
    },
    {
        title: "River Ranch",
        distance: "~20 min",
        body: "River swim, horseshoes, volleyball, disc golf.",
        badges: [
            { label: "Easy", tone: "sr" },
            { label: "Low cost", tone: "free" },
        ],
    },
    {
        title: "Knights Ferry float",
        distance: "~1 hr each way",
        body: "7-mile tube/raft float, 3.5–5 hours. Free shuttle back.",
        lines: ["Reservations required. Last shuttle 5:30 PM.", "📞 (209) 847-4671"],
        badges: [
            { label: "Long · must swim", tone: "no" },
            { label: "Paid", tone: "pay" },
        ],
    },
    {
        title: "Trout fishing",
        distance: "Pinecrest · Lyons · Beardsley",
        body: "All stocked. Lyons is quiet bank fishing.",
        lines: ["License for ages 16+. Buy at wildlife.ca.gov."],
        badges: [
            { label: "Easy bank fishing", tone: "sr" },
            { label: "License fee", tone: "pay" },
        ],
    },
    {
        title: "Mini golf",
        distance: "~5 min drive · village",
        body: "Easy evening option for all ages.",
        badges: [
            { label: "Easy", tone: "sr" },
            { label: "Low cost", tone: "pay" },
        ],
    },
    {
        title: "Columbia State Historic Park",
        distance: "~30 min",
        body: "Walkable gold-rush town — stagecoach, shops, gold panning.",
        badges: [
            { label: "Easy", tone: "sr" },
            { label: "Free entry", tone: "free" },
        ],
    },
    {
        title: "Twain Harte Lake",
        distance: "In town",
        body: "Private lake — day passes usually require a member host.",
        lines: ["📞 (209) 586-4449"],
        badges: [{ label: "Call first", tone: "no" }],
    },
];

export const LOCAL_GEMS: { section: string; cards: ActivityCard[] }[] = [
    {
        section: "Evenings",
        cards: [
            {
                title: "Movies Under the Stars",
                distance: "Pinecrest · ~30 min · Friday",
                body: "The Mandalorian and Grogu — outdoor movie by the lake. Starts ~8:30 PM.",
                lines: ["$10 · kids 2 and under free"],
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "$", tone: "pay" },
                ],
            },
            {
                title: "Strawberry General Store",
                distance: "~35 min · Fri/Sat eves",
                body: "Live music and BBQ on the lawn. Confirm June dates.",
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "Free music", tone: "free" },
                ],
            },
            {
                title: "Eproson Park concerts",
                distance: "Twain Harte · Sat 6–8 PM",
                body: "Free concerts in the village. Falls on departure Saturday.",
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "Free", tone: "free" },
                ],
            },
        ],
    },
    {
        section: "Day trips",
        cards: [
            {
                title: "Indigeny Reserve",
                distance: "~30 min · Sonora",
                body: "Apple ranch — picnic grounds, easy paths, disc golf, cider tasting.",
                lines: ["Grounds 8 AM–6 PM"],
                badges: [
                    { label: "Easy", tone: "sr" },
                    { label: "Free to roam", tone: "free" },
                ],
            },
            {
                title: "Railtown 1897",
                distance: "~30 min · Jamestown",
                body: "Historic steam trains and movie-prop roundhouse.",
                lines: ["Call before visiting — train rides may be paused.", "📞 (209) 984-3953"],
                badges: [
                    { label: "Easy", tone: "sr" },
                    { label: "Low cost", tone: "pay" },
                ],
            },
            {
                title: "Moaning Cavern",
                distance: "~45 min",
                body: "Big cave chamber. Tour is ~235 stairs down and back.",
                badges: [
                    { label: "235 stairs", tone: "no" },
                    { label: "Paid", tone: "pay" },
                ],
            },
        ],
    },
    {
        section: "Rainy or hot afternoon",
        cards: [
            {
                title: "Black Oak Casino",
                distance: "~20 min · Tuolumne",
                body: "Bowling, arcade, trampolines, batting cages.",
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "Paid", tone: "pay" },
                ],
            },
            {
                title: "Twain Harte public pool",
                distance: "In town",
                body: "Rec swim 1–5 PM Mon–Sat if the house pool is crowded.",
                badges: [
                    { label: "Easy", tone: "sr" },
                    { label: "Low cost", tone: "free" },
                ],
            },
        ],
    },
];

export const CHECKLIST: ChecklistDef[] = [
    {
        key: "boat",
        title: "Pinecrest party boat — Wed AM",
        detail: "2-hour morning slot. Consider two boats for 20 people.",
        phone: "📞 (209) 965-3333",
        priority: "now",
    },
    {
        key: "lic",
        title: "Fishing licenses (16+)",
        detail: "Buy online before Thursday.",
        phone: "🌐 wildlife.ca.gov",
        priority: "soon",
    },
    {
        key: "knights",
        title: "Knights Ferry float (if doing Friday)",
        detail: "Reserve ahead. Confirm shuttle timing (last run 5:30 PM).",
        phone: "📞 (209) 847-4671",
        priority: "soon",
    },
    {
        key: "thl",
        title: "Twain Harte Lake access",
        detail: "One call to see if day passes are possible.",
        phone: "📞 (209) 586-4449",
        priority: "flex",
    },
    {
        key: "groc",
        title: "Groceries + firewood (Tuesday)",
        detail: "Breakfasts, boat lunches, s'mores, Game Night snacks.",
        priority: "soon",
    },
    {
        key: "quarters",
        title: "Quarters for hatchery (Thursday)",
        detail: "Fish feeders take quarters.",
        priority: "flex",
    },
    {
        key: "gear",
        title: "Sun & water gear",
        detail: "Sunscreen, hats, water shoes, cooler, pool floats, fishing tackle.",
        priority: "flex",
    },
    {
        key: "game",
        title: "Game Night supplies (by Thursday)",
        detail: "See Guide → Game Night for the list.",
        priority: "flex",
    },
];

export const GAME_NIGHT = {
    intro: "Thursday at the pool. Mix ages on each team — not everyone has to get wet.",
    format: "Three teams of ~6. Wet relay first, then dry Family Feud. Tally points across both.",
    stations: [
        { name: "Noodle Joust", points: "+10", detail: "Foam noodles on pool floats — knock the other rider off." },
        { name: "Sponge Sprint", points: "+10", detail: "Soak a sponge, carry it across, wring into your bucket." },
        { name: "Cannonball Contest", points: "+10", detail: "Judges score splashes 1–10." },
        { name: "Float Paddle Race", points: "+10", detail: "Paddle a float down and back." },
        { name: "Penny Dive", points: "+1 each", detail: "Coins in the shallow end — collect in 60 seconds." },
    ],
    feud: '8–10 family trivia questions (e.g. "Name a dish at every reunion"). Dry round, towels on.',
    equipment: [
        "2+ pool floats",
        "4–6 foam noodles",
        "2 buckets",
        "4 sponges",
        "Coins",
        "Whistle",
        "Scorecard",
        "Small prizes",
        "Towels",
    ],
};

export const MEAL_LABELS: Record<import("@/lib/types").MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
};

export type RoomLocation = "main-house" | "barn";

export type RoomAssignee =
    | { type: "household"; household: string }
    | { type: "person"; name: string; household: string; note?: string };

export interface TripRoom {
    id: string;
    name: string;
    location: RoomLocation;
    assignees: RoomAssignee[];
    /** Unclaimed until a household taps to claim (synced via roomAssignments) */
    claimableBy?: string[];
    offLimits?: boolean;
    offLimitsNote?: string;
}

export const ROOM_LOCATION_LABELS: Record<RoomLocation, string> = {
    "main-house": "Main house",
    barn: "Barn",
};

export const TRIP_ROOMS: TripRoom[] = [
    {
        id: "main-master",
        name: "Main floor master",
        location: "main-house",
        claimableBy: ["Ben & Stephanie", "Darren & Alicia"],
        assignees: [],
    },
    {
        id: "upstairs-queen-near-bunks",
        name: "Upstairs queen (near bunks)",
        location: "main-house",
        claimableBy: ["Ben & Stephanie", "Darren & Alicia"],
        assignees: [],
    },
    {
        id: "upstairs-queen",
        name: "Upstairs queen",
        location: "main-house",
        assignees: [
            { type: "person", name: "Dick", household: "Dick, Jan & Ryan" },
            { type: "person", name: "Jan", household: "Dick, Jan & Ryan" },
        ],
    },
    {
        id: "bunk-jan-ryan",
        name: "Bunk room",
        location: "main-house",
        assignees: [
            { type: "person", name: "Jan", household: "Dick, Jan & Ryan" },
            { type: "person", name: "Ryan", household: "Dick, Jan & Ryan", note: "Tigger bunk" },
        ],
    },
    {
        id: "bunk-kids-ik",
        name: "Bunk room",
        location: "main-house",
        assignees: [
            { type: "person", name: "Arielle", household: "Ian & Kimberly" },
            { type: "person", name: "Asher", household: "Ian & Kimberly" },
            { type: "person", name: "Brynn", household: "Ian & Kimberly" },
        ],
    },
    {
        id: "separate-entrance",
        name: "Separate entrance room",
        location: "main-house",
        assignees: [
            { type: "household", household: "Ian & Kimberly" },
            { type: "person", name: "Mario", household: "Ian & Kimberly", note: "May be pet" },
        ],
    },
    {
        id: "barn-off-limits",
        name: "10 single-bed bunk room",
        location: "barn",
        offLimits: true,
        offLimitsNote: "Kids cannot enter even to play.",
        assignees: [],
    },
    {
        id: "barn-bunk-1",
        name: "Bunk room 1",
        location: "barn",
        assignees: [
            { type: "person", name: "Selah", household: "Darren & Alicia" },
            { type: "person", name: "Maddie", household: "Ben & Stephanie" },
            { type: "person", name: "Eliana", household: "Ian & Kimberly" },
            { type: "person", name: "Joselyn", household: "Ian & Kimberly" },
        ],
    },
    {
        id: "barn-bunk-2",
        name: "Bunk room 2",
        location: "barn",
        assignees: [
            { type: "person", name: "Malakhi", household: "Gabe" },
            { type: "person", name: "Isaiah", household: "Gabe" },
            { type: "person", name: "Declan", household: "Gabe" },
            { type: "person", name: "Gabe", household: "Gabe" },
        ],
    },
];

export const SUGGESTED_DINNERS: Partial<Record<DayId, string>> = {
    "tue-23": "Easy dinner at the house",
    "wed-24": "Simple meal after portraits",
    "thu-25": "Finger food before Game Night",
    "fri-26": "Easy dinner — movie at 8:30 PM",
};
