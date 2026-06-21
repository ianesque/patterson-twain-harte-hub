import { ACTIVITY_MENU, GAME_NIGHT, LOCAL_GEMS } from "@/data/trip-content";
import { TripBadge } from "@/components/trip/trip-ui";

function ActivityCardGrid({ cards }: { cards: typeof ACTIVITY_MENU }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
                <article key={card.title} className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                    <h4 className="font-semibold text-primary">{card.title}</h4>
                    <p className="text-xs font-semibold text-tertiary">{card.distance}</p>
                    <p className="mt-2 text-sm text-secondary">{card.body}</p>
                    {card.lines?.map((line) => (
                        <p key={line} className="mt-1 text-sm text-secondary">
                            {line}
                        </p>
                    ))}
                    <div className="mt-3 flex flex-wrap gap-1">
                        {card.badges.map((b) => (
                            <TripBadge key={b.label} label={b.label} tone={b.tone} />
                        ))}
                    </div>
                </article>
            ))}
        </div>
    );
}

export function ActivitiesReferencePanel() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-primary">Activity menu</h2>
                <p className="mt-1 text-sm text-tertiary">Best options within ~45 min (Knights Ferry is the longer exception).</p>
            </div>
            <ActivityCardGrid cards={ACTIVITY_MENU} />
            <p className="rounded-xl border border-dashed border-secondary bg-secondary px-3 py-2 text-sm text-tertiary">
                With a &quot;do it right&quot; budget, grab a Pinecrest party boat early (maybe two for 18 people) and book Knights Ferry only if
                the crew wants the full float.
            </p>
        </div>
    );
}

export function GemsReferencePanel() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-primary">Local gems</h2>
                <p className="mt-1 text-sm text-tertiary">What the guidebooks skip — grouped by vibe with honest access notes.</p>
            </div>
            {LOCAL_GEMS.map((group) => (
                <section key={group.section}>
                    <h3 className="mb-3 text-md font-semibold text-brand-secondary">{group.section}</h3>
                    <ActivityCardGrid cards={group.cards} />
                </section>
            ))}
        </div>
    );
}

export function GameNightReferencePanel() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-primary">Patterson Family Game Night</h2>
                <p className="mt-1 text-sm text-tertiary">{GAME_NIGHT.intro}</p>
            </div>

            <article className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                <h3 className="font-semibold text-primary">Format</h3>
                <p className="mt-2 text-sm text-secondary">{GAME_NIGHT.format}</p>
            </article>

            <article className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                <h3 className="font-semibold text-primary">Pool relay stations</h3>
                <div className="mt-3 space-y-3">
                    {GAME_NIGHT.stations.map((s) => (
                        <div key={s.name} className="border-l-3 border-brand-solid pl-3">
                            <p className="font-semibold text-primary">
                                {s.name} <span className="text-sm text-utility-error-600">{s.points}</span>
                            </p>
                            <p className="text-sm text-secondary">{s.detail}</p>
                        </div>
                    ))}
                </div>
            </article>

            <article className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                <h3 className="font-semibold text-primary">Dry round — Patterson Family Feud</h3>
                <p className="mt-2 text-sm text-secondary">{GAME_NIGHT.feud}</p>
            </article>

            <article className="rounded-2xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                <h3 className="font-semibold text-primary">Equipment kit</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                    {GAME_NIGHT.equipment.map((item) => (
                        <span key={item} className="rounded-full border border-secondary bg-secondary px-3 py-1 text-sm text-secondary">
                            {item}
                        </span>
                    ))}
                </div>
            </article>
        </div>
    );
}
