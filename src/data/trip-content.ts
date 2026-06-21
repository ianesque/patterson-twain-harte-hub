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
                body: "Stop for groceries and firewood in Sonora on the way up.",
            },
            {
                icon: "🚗",
                title: "Stagger arrivals",
                body: "No fixed schedule after check-in — keep the evening easy.",
            },
            {
                icon: "🏊",
                title: "Pool",
                body: "Unwind after the drive. Draft Game Night teams if kids are up for it.",
            },
            {
                icon: "🍦",
                title: "Welcome dinner",
                body: "At the house, or a quick drive to Twain Harte Creamery on Fuller Rd (~5 min) if there's daylight.",
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
                body: "Book a 2-hour morning slot (before noon). Cooler + lunch on board. Two boats if needed for 18.",
            },
            {
                icon: "🏖️",
                title: "Beach 1",
                body: "Buoyed swim area — good for the little ones. Snack bar and restrooms on site.",
            },
            {
                icon: "⏰",
                title: "Home by mid-afternoon",
                body: "Shower and change before portraits.",
            },
            {
                icon: "📸",
                title: "Family portraits",
                body: "Golden hour. Coordinate outfits ahead of time. Keep the rest of the evening light.",
            },
        ],
    },
    {
        id: "thu-25",
        weekday: "THU",
        dayNum: "25",
        title: "Fish & feed trout",
        theme: "Hatchery · fishing · pool · movie night",
        tag: "Easy day",
        tagTone: "easy",
        effortAccess: "Hatchery is flat and paved. Lyons has easy bank fishing. Bring layers for the outdoor movie.",
        rows: [
            {
                icon: "🐟",
                title: "Fish hatchery",
                body: "Bring quarters to feed trout. Open 7:30 AM–3:30 PM.",
            },
            {
                icon: "🎣",
                title: "Trout fishing",
                body: "Pinecrest, Lyons, or Beardsley. Ages 16+ need a CA license — buy online before you go.",
            },
            {
                icon: "🏊",
                title: "Pool afternoon",
                body: "Quiet time before Friday.",
            },
            {
                icon: "🎬",
                title: "Movies Under the Stars",
                body: "Pinecrest amphitheater, ~8:30 PM. Blankets, low chairs, jackets.",
            },
        ],
    },
    {
        id: "fri-26",
        weekday: "FRI",
        dayNum: "26",
        title: "River day → Game Night",
        theme: "Float or River Ranch · pool games tonight",
        tag: "Pick your level",
        tagTone: "mod",
        effortAccess: "Knights Ferry is a long float — swimming required. River Ranch is closer and mellow. Pool day always works.",
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
                icon: "🎉",
                title: "Game Night",
                body: "Friday at the pool. See the Guide tab for the plan.",
            },
        ],
    },
    {
        id: "sat-27",
        weekday: "SAT",
        dayNum: "27",
        title: "Hike & head home",
        theme: "Easy outing · pack up",
        tag: "Flexible",
        tagTone: "easy",
        effortAccess: "Columbia is flat and walkable — ~30 min toward Sonora.",
        rows: [
            {
                icon: "🥾",
                title: "Morning outing",
                body: "Columbia State Historic Park — gold-rush town, shops, stagecoach, gold panning.",
            },
            {
                icon: "📦",
                title: "Pack up",
                body: "Leave in waves. Final pool dip if there's time.",
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
        id: "thu-day",
        dayId: "thu-25",
        title: "Thursday — daytime",
        description: "Hatchery, fishing, or pool.",
        defaultOptionId: "hatchery",
        options: [
            { id: "hatchery", label: "Fish hatchery", description: "~40 min · feed trout · flat & easy" },
            { id: "fishing", label: "Trout fishing", description: "Pinecrest, Lyons, or Beardsley" },
            { id: "pool-home", label: "Pool at the house", description: "Quiet afternoon at base camp" },
        ],
    },
    {
        id: "thu-evening",
        dayId: "thu-25",
        title: "Thursday — evening",
        description: "Outdoor movie or stay home.",
        defaultOptionId: "movie-in",
        options: [
            { id: "movie-in", label: "Outdoor movie", description: "Pinecrest · ~8:30 PM · bring layers" },
            { id: "movie-out", label: "Stay at the house", description: "Pool or early night" },
        ],
    },
    {
        id: "fri-river",
        dayId: "fri-26",
        title: "Friday — river day",
        description: "Not everyone has to go. Some may stay at the pool.",
        defaultOptionId: "river-ranch",
        options: [
            {
                id: "knights-ferry",
                label: "Knights Ferry float",
                description: "7 mi · 3.5–5 hrs · ~1 hr drive each way",
            },
            {
                id: "river-ranch",
                label: "River Ranch",
                description: "~20 min · mellow riverfront",
            },
            {
                id: "pool-home",
                label: "Stay at the house",
                description: "Pool day at base camp",
            },
        ],
    },
    {
        id: "sat-morning",
        dayId: "sat-27",
        title: "Saturday — Columbia",
        description: "Gold-rush town on the way toward Sonora (~30 min).",
        defaultOptionId: "columbia",
        options: [{ id: "columbia", label: "Columbia", description: "Walkable town · shops · gold panning" }],
    },
];

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
                distance: "Pinecrest · ~30 min",
                body: "Outdoor movie by the lake. Starts ~8:30 PM.",
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
        detail: "2-hour morning slot. Consider two boats for 18 people.",
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
        title: "Game Night supplies (by Friday)",
        detail: "See Guide → Game Night for the list.",
        priority: "flex",
    },
];

export const GAME_NIGHT = {
    intro: "Friday at the pool. Mix ages on each team — not everyone has to get wet.",
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

export const SUGGESTED_DINNERS: Partial<Record<DayId, string>> = {
    "tue-23": "Easy dinner at the house",
    "wed-24": "Simple meal after portraits",
    "thu-25": "Grill or pasta",
    "fri-26": "Finger food before Game Night",
};
