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
    subtitle: "Three generations · 18 Pattersons · ages 6 to 80",
    dates: "Tue Jun 23 – Sat Jun 27, 2026",
    pills: ["📅 Tue Jun 23 – Sat Jun 27, 2026", "🏊 Pool house base camp", "🎣 Fish · Float · Hike · Play"],
};

export const DAYS: DayPlan[] = [
    {
        id: "tue-23",
        weekday: "TUE",
        dayNum: "23",
        title: "Drive Up & Settle In",
        theme: "Arrive at check-in · pool · welcome dinner",
        tag: "Arrival day",
        tagTone: "easy",
        effortAccess:
            "Low-key by design — house and poolside, no walking required. The optional village stroll is flat sidewalks.",
        rows: [
            {
                icon: "🚗",
                title: "Travel day — arrive at check-in time.",
                body: "Plan a grocery + firewood stop in Sonora on the way up so the house is stocked the moment you land. Keep the evening unscheduled and easy.",
            },
            {
                icon: "🏊",
                title: "Pool to unwind.",
                body: 'Let the kids shake off the car ride; do a low-key "team draft" for Friday\'s Game Night so the little ones get excited.',
            },
            {
                icon: "🍦",
                title: "Easy welcome dinner",
                body: "At the house, or a short walk into Twain Harte village (candy/ice-cream, Eproson Park) if there's daylight left after settling in.",
            },
        ],
    },
    {
        id: "wed-24",
        weekday: "WED",
        dayNum: "24",
        title: "Pinecrest Lake Day",
        theme: "Party boat · swim beach · 📸 portraits tonight",
        tag: "All ages",
        tagTone: "easy",
        effortAccess:
            "Party boat is seated and shaded; the beach is sandy and flat, and the first ~½ mile of the lakeshore loop is level. Easy to do at any pace, with a relaxed window before portraits.",
        rows: [
            {
                icon: "⛵",
                title: "Reserve a party/pontoon boat",
                body: "Book a 2-hour morning slot before noon. Bring a cooler + lunch aboard. Rotate the family through in two waves, or grab two boats.",
            },
            {
                icon: "🏖️",
                title: "Beach 1 swim area",
                body: "Buoyed and sandy — ideal for the 6-year-olds. Snack bar + new restrooms on site.",
            },
            {
                icon: "⏰",
                title: "Head back by mid-afternoon",
                body: "Shower, dry off, and dress — leave a comfortable buffer before portraits.",
            },
            {
                icon: "📸",
                title: "Family portraits this evening.",
                body: "Coordinate outfits in advance, aim for the golden-hour window, and corral all 18. This is the evening's anchor — keep it light otherwise.",
            },
        ],
    },
    {
        id: "thu-25",
        weekday: "THU",
        dayNum: "25",
        title: "Fish & Feed the Trout",
        theme: "Hatchery morning · fishing · pool afternoon",
        tag: "Easy + fishing",
        tagTone: "easy",
        effortAccess:
            "The hatchery is flat, paved, shaded, with benches and restrooms — minimal effort. Lyons has easy bank fishing. The amphitheater has bench seating but cools off after dark, so bring layers.",
        rows: [
            {
                icon: "🐟",
                title: "Moccasin Creek Fish Hatchery",
                body: "Bring quarters; little ones feed thousands of trout. Flat, paved, restrooms. Open 7:30–3:30.",
            },
            {
                icon: "🎣",
                title: "Trout fishing",
                body: "Pinecrest, Lyons Reservoir, or Beardsley are all stocked. Anyone 16+ needs a CA license (buy online first).",
            },
            {
                icon: "🏊",
                title: "Home pool afternoon",
                body: "Nap window for the youngest before a big Friday.",
            },
            {
                icon: "🎬",
                title: "Evening: Movies Under the Stars",
                body: "Pinecrest amphitheater (~8:30 PM). Pack blankets, low chairs and jackets.",
            },
        ],
    },
    {
        id: "fri-26",
        weekday: "FRI",
        dayNum: "26",
        title: "River Day → Game Night",
        theme: "Tube/raft OR River Ranch · evening showdown",
        tag: "Pick your level",
        tagTone: "mod",
        effortAccess:
            "Knights Ferry is a 3.5–5 hr float that needs full swimming mobility. River Ranch is the low-effort alternative — shaded riverside seating right at the water, and an easy home/pool day is always an option. Game Night has plenty of dry, seated roles too.",
        rows: [
            {
                icon: "🌊",
                title: "Option A — Big adventure:",
                body: "Knights Ferry tube/raft float (7 mi, 3.5–5 hrs, free shuttle back). ~1 hr each way — a committed full day for the able-bodied crew.",
            },
            {
                icon: "🏕️",
                title: "Option B — Mellow & close:",
                body: "River Ranch (~20 min) — clean riverfront swimming, horseshoes, sand volleyball, disc golf, native fishing.",
            },
            {
                icon: "🎉",
                title: "Evening: Patterson Family Game Night",
                body: "Themed relay + trivia at the pool. See the Game Night tab for the full plan.",
            },
        ],
    },
    {
        id: "sat-27",
        weekday: "SAT",
        dayNum: "27",
        title: "Hike & Farewell",
        theme: "Easy hike · gold-rush town · pack up",
        tag: "Flexible",
        tagTone: "easy",
        effortAccess:
            "Columbia is flat, shaded and bench-lined; the Pinecrest loop can be a short out-and-back as far as you like. Gold panning is low-effort and all-ages.",
        rows: [
            {
                icon: "🥾",
                title: "Choose your hike:",
                body: "Flat Pinecrest lakeshore loop (out-and-back as far as comfortable), or Columbia State Historic Park — walkable 1850s gold-rush town with shops, stagecoach, candy & gold panning.",
            },
            {
                icon: "📦",
                title: "Pack & tidy",
                body: "In waves; final pool dip; group photo before everyone scatters.",
            },
        ],
    },
];

export const SPLITTABLE_ACTIVITIES: SplittableActivity[] = [
    {
        id: "fri-river",
        dayId: "fri-26",
        title: "Friday daytime — pick your adventure",
        description: "The float is optional and long; River Ranch keeps everyone closer. Some adults may stay at the pool.",
        options: [
            {
                id: "knights-ferry",
                label: "Knights Ferry float",
                description: "7 mi, 3.5–5 hrs · ~1 hr drive each way · swimming mobility required",
            },
            {
                id: "river-ranch",
                label: "River Ranch",
                description: "~20 min · mellow riverfront swim & play · keeps the group together",
            },
            {
                id: "pool-home",
                label: "Stay at the house / pool",
                description: "Low-key day at base camp while others are on the river",
            },
        ],
    },
    {
        id: "thu-movie",
        dayId: "thu-25",
        title: "Thursday evening — Movies Under the Stars",
        description: "Outdoor movie at Pinecrest (~8:30 PM). Some may prefer an early night at the house.",
        options: [
            { id: "movie-in", label: "Going to the movie", description: "Pinecrest amphitheater · bring layers" },
            { id: "movie-out", label: "Skipping — staying home", description: "Pool/house evening instead" },
        ],
    },
    {
        id: "sat-morning",
        dayId: "sat-27",
        title: "Saturday morning outing",
        description: "Split-friendly before pack-up.",
        options: [
            { id: "pinecrest-loop", label: "Pinecrest lakeshore loop", description: "Flat out-and-back as far as you like" },
            { id: "columbia", label: "Columbia State Historic Park", description: "Gold-rush town · shops · gold panning" },
            { id: "sat-pool", label: "Pool / pack-up only", description: "Skip the outing and help close the house" },
        ],
    },
];

export const ACTIVITY_MENU: ActivityCard[] = [
    {
        title: "Pinecrest Lake & Marina ⭐",
        distance: "~30 min · the hub of the week",
        body: "Party/pontoon boats, fishing boats, kayaks, paddleboats, sailboats; buoyed swim beach, snack bar, flat 4-mi lakeshore loop.",
        lines: ["Boats: party boat 2-hr slots before noon; book ahead. Marina 6 AM–8 PM.", "📞 Marina (209) 965-3333"],
        badges: [
            { label: "Low effort", tone: "sr" },
            { label: "Paid rentals", tone: "pay" },
        ],
    },
    {
        title: "Moccasin Creek Fish Hatchery",
        distance: "~40 min · Hwy 49/120 jct",
        body: "Feed thousands of trout (bring quarters), see trophy & baby fish. Flat, paved, restrooms.",
        lines: ["Hours: 7:30 AM–3:30 PM daily · free entry"],
        badges: [
            { label: "Low effort", tone: "sr" },
            { label: "Free", tone: "free" },
        ],
    },
    {
        title: "River Ranch Campground",
        distance: "~20 min · Tuolumne",
        body: "Clean North Fork Tuolumne riverfront — swimming, native fishing, horseshoes, sand volleyball, disc golf.",
        badges: [
            { label: "Low effort (shaded riverside)", tone: "sr" },
            { label: "Low cost", tone: "free" },
        ],
    },
    {
        title: "Knights Ferry Tube / Raft Float",
        distance: "~1 hr each way · River Journey",
        body: "7-mi self-guided float, Class II at the start, free shuttle back. 3.5–5 hrs on the water.",
        lines: ["Last shuttle: 5:30 PM from Orange Blossom. Reservations required.", "📞 River Journey (209) 847-4671"],
        badges: [
            { label: "3.5–5 hrs · swimming mobility", tone: "no" },
            { label: "Paid", tone: "pay" },
        ],
    },
    {
        title: "Trout & Fly Fishing",
        distance: "Pinecrest · Lyons · Beardsley",
        body: "All stocked with trout. Lyons is quiet and bank-friendly; Pinecrest is easy with the boat.",
        lines: ["License required for anglers 16+. Buy online via CDFW."],
        badges: [
            { label: "Bank fishing = low effort", tone: "sr" },
            { label: "License fee", tone: "pay" },
        ],
    },
    {
        title: "Mini Golf",
        distance: "In/near Twain Harte village · walkable",
        body: "Low-key evening option — competitive enough for teens, easy enough for everyone.",
        badges: [
            { label: "Low effort", tone: "sr" },
            { label: "Low cost", tone: "pay" },
        ],
    },
    {
        title: "Columbia State Historic Park",
        distance: "~25–30 min · living gold-rush town",
        body: "Walkable 1850s Main Street — stagecoach, candy & sarsaparilla, gold panning, shops.",
        badges: [
            { label: "Low effort", tone: "sr" },
            { label: "Free entry", tone: "free" },
        ],
    },
    {
        title: "Twain Harte Lake (heads-up)",
        distance: "In town · private membership",
        body: "Private association lake. Non-members generally can't buy day passes unless hosted by a member.",
        lines: ["📞 THL Assoc. (209) 586-4449"],
        badges: [{ label: "Likely no access", tone: "no" }],
    },
];

export const LOCAL_GEMS: { section: string; cards: ActivityCard[] }[] = [
    {
        section: "🌙 Only-here evenings",
        cards: [
            {
                title: "Movies Under the Stars — Pinecrest Amphitheater ⭐",
                distance: "~30 min · most summer nights, dusk",
                body: "Outdoor movie screen by the lake, films start ~8:30 PM. Some Wednesdays a ranger program runs first.",
                lines: ["Cost: $10; kids 2 & under free."],
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "Cheap", tone: "pay" },
                ],
            },
            {
                title: "Strawberry General Store — Live Music & BBQ",
                distance: "~35 min · select Fri/Sat eves 5–8 PM",
                body: "Lawn, river air, local bands and a BBQ. A June 27 date is on the summer calendar — confirm the exact night.",
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "Free music", tone: "free" },
                ],
            },
            {
                title: "Eproson Park Summer Concerts (Twain Harte)",
                distance: "In town · Saturdays 6–8 PM · free",
                body: "Free Saturday-night concerts in the village green. Falls on departure Saturday.",
                badges: [
                    { label: "All ages", tone: "sr" },
                    { label: "Free", tone: "free" },
                ],
            },
        ],
    },
    {
        section: "🍎 Underrated daytime outings",
        cards: [
            {
                title: "Indigeny Reserve ⭐",
                distance: "~25–30 min · Sonora hills",
                body: "160-acre organic apple ranch: shaded picnic grounds, covered bridge, easy paths, disc golf, kids' play areas, cider/spirits tasting, weekend food trucks.",
                lines: ["Hours: grounds 8–6 daily; tasting room 10–5."],
                badges: [
                    { label: "Low effort", tone: "sr" },
                    { label: "Free to roam", tone: "free" },
                ],
            },
            {
                title: "Railtown 1897 (Jamestown)",
                distance: "~25–30 min · Hollywood's steam trains",
                body: "Locomotives from Back to the Future III & Petticoat Junction. Roundhouse + movie-prop tours daily.",
                lines: ["Heads-up: excursion train rides were temporarily paused — call (209) 984-3953."],
                badges: [
                    { label: "Low effort", tone: "sr" },
                    { label: "Low cost", tone: "pay" },
                ],
            },
            {
                title: "Moaning Cavern Adventure Park",
                distance: "~45 min · Vallecito",
                body: "Largest single cave chamber in California. Spiral-staircase tour is ~235 steps down and back. Surface activities are low-effort.",
                badges: [
                    { label: "Cave tour: 235 stairs", tone: "no" },
                    { label: "Paid", tone: "pay" },
                ],
            },
        ],
    },
    {
        section: "🎳 Hot-afternoon / rainy-day backup",
        cards: [
            {
                title: "Black Oak Casino — Bowling, Arcade & Elevate",
                distance: "~15–20 min · Tuolumne",
                body: "24-lane bowling, arcade, and Elevate indoor action park — ninja course, trampolines, batting cages, axe throwing.",
                badges: [
                    { label: "Something for every age", tone: "sr" },
                    { label: "Paid", tone: "pay" },
                ],
            },
            {
                title: "Twain Harte Public Pool",
                distance: "In town · rec swim 1–5 PM Mon–Sat",
                body: "In-town water option if the house pool gets crowded.",
                badges: [
                    { label: "Low effort", tone: "sr" },
                    { label: "Low cost", tone: "free" },
                ],
            },
        ],
    },
];

export const CHECKLIST: ChecklistDef[] = [
    {
        key: "boat",
        title: "Pinecrest party/pontoon boat — Wed AM",
        detail: "Reserve a 2-hr morning slot (before noon). Consider TWO boats for 18 people.",
        phone: "📞 (209) 965-3333",
        priority: "now",
    },
    {
        key: "lic",
        title: "CA fishing licenses (anglers 16+)",
        detail: "Buy online before Thursday. Decide 1-day vs. multi-day per person.",
        phone: "🌐 wildlife.ca.gov → Online License Sales",
        priority: "soon",
    },
    {
        key: "knights",
        title: "Knights Ferry float (IF doing Fri)",
        detail: "Reservations required. Confirm headcount, life jackets, and 5:30 PM last-shuttle plan.",
        phone: "📞 River Journey (209) 847-4671",
        priority: "soon",
    },
    {
        key: "thl",
        title: "Confirm Twain Harte Lake access",
        detail: "One quick call to confirm whether any guest/day option exists.",
        phone: "📞 (209) 586-4449",
        priority: "flex",
    },
    {
        key: "groc",
        title: "Grocery + firewood haul (Tue)",
        detail: "Stock for 18: breakfasts, cooler/boat lunches, s'mores, Game Night snacks.",
        priority: "soon",
    },
    {
        key: "quarters",
        title: "Roll of quarters for the hatchery (Thu)",
        detail: "Fish-feed dispensers take quarters — grab a few dollars' worth.",
        priority: "flex",
    },
    {
        key: "gear",
        title: "Pack water/sun gear",
        detail: "Water shoes, reef-safe sunscreen, hats, pool floats/noodles, cooler, fishing tackle.",
        priority: "flex",
    },
    {
        key: "game",
        title: "Assemble Game Night kit (by Fri)",
        detail: "See the Game Night tab for the full equipment list and prizes.",
        priority: "flex",
    },
];

export const GAME_NIGHT = {
    intro: "Friday evening at the pool. Built for ages 6–80: every team mixes the generations. Not everyone needs to get wet — judges, scorekeepers, and the dry trivia round give every energy level a real role.",
    format: 'Draft 3 teams of ~6, each named after a Patterson era/in-joke. Run the wet relay first, then the dry "Patterson Feud" round. Tally points across all events.',
    stations: [
        { name: "Noodle Joust", points: "+10 win", detail: "Two riders on pool floats, foam noodles, first to topple the other." },
        { name: "Sponge Bucket Sprint", points: "+10", detail: "Soak a sponge, swim/run it across, wring into your team's bucket." },
        { name: "Cannonball Contest", points: "+10 splash", detail: "Judges score splashes 1–10 — a great seated role for anyone staying dry." },
        { name: "Float Paddle Race", points: "+10", detail: "Hand-paddle a pool float down and back. Pair a strong swimmer with a little one." },
        { name: "Penny Dive Scramble", points: "+1 each", detail: "Toss coins to the shallow end; teams collect in 60 sec." },
    ],
    feud: 'Pre-write 8–10 survey-style questions about the family (e.g., "Name a dish that shows up at every reunion"). Poolside, towels on.',
    equipment: [
        "2+ pool floats",
        "4–6 foam noodles",
        "2 buckets",
        "4 sponges",
        "bag of coins/pennies",
        "whistle",
        "scorecard + marker",
        "waterproof phone for photos",
        "small prizes / candy",
        "towels",
    ],
};

export const MEAL_LABELS: Record<import("@/lib/types").MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
};

export const SUGGESTED_DINNERS: Partial<Record<DayId, string>> = {
    "tue-23": "Easy welcome dinner at the house (or village stroll + ice cream)",
    "wed-24": "Light post-portrait meal — keep it simple after photos",
    "thu-25": "Grill or pasta night before/after movie (your call)",
    "fri-26": "Pre–Game Night finger food & snacks at the pool",
    "sat-27": "Leftovers / clean-out-the-fridge farewell",
};
