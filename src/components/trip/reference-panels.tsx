import { ACTIVITY_MENU, GAME_NIGHT, LOCAL_GEMS } from "@/data/trip-content";
import { PanelHeader, PhoneLine, TripBadge } from "@/components/trip/trip-ui";

function ActivityCardGrid({ cards }: { cards: typeof ACTIVITY_MENU }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
                <article key={card.title} className="trip-card flex flex-col p-4 sm:p-5">
                    <h4 className="text-[var(--trip-title-card)] font-semibold leading-snug tracking-tight text-primary">{card.title}</h4>
                    <p className="mt-1.5 text-[var(--trip-caption)] font-semibold uppercase tracking-wide text-tertiary">{card.distance}</p>
                    <p className="mt-2.5 flex-1 text-[var(--trip-body-sm)] leading-relaxed text-secondary sm:text-[var(--trip-body)]">{card.body}</p>
                    {card.lines?.map((line) =>
                        line.includes("(") && line.includes(")") ? (
                            <PhoneLine key={line} line={line} />
                        ) : (
                            <p key={line} className="mt-1 text-sm text-secondary">
                                {line}
                            </p>
                        ),
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
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
        <div className="space-y-6">
            <PanelHeader title="Day trips" description="Most are within 45 minutes. Knights Ferry is ~1 hour each way." />
            <ActivityCardGrid cards={ACTIVITY_MENU} />
            <p className="trip-callout">Book Pinecrest boats early — two boats if all 18 want to go together.</p>
        </div>
    );
}

export function GemsReferencePanel() {
    return (
        <div className="space-y-8">
            <PanelHeader title="Extras" description="Evenings, backups, and side trips." />
            {LOCAL_GEMS.map((group) => (
                <section key={group.section}>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-secondary">{group.section}</h3>
                    <ActivityCardGrid cards={group.cards} />
                </section>
            ))}
        </div>
    );
}

export function GameNightReferencePanel() {
    return (
        <div className="space-y-6">
            <PanelHeader title="Game Night" description={GAME_NIGHT.intro} />

            <article className="trip-card p-4 sm:p-5">
                <h3 className="font-semibold text-primary">Format</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{GAME_NIGHT.format}</p>
            </article>

            <article className="trip-card p-4 sm:p-5">
                <h3 className="font-semibold text-primary">Pool relay</h3>
                <div className="mt-4 space-y-4">
                    {GAME_NIGHT.stations.map((s) => (
                        <div key={s.name} className="border-l-[3px] border-brand-solid pl-4">
                            <p className="font-semibold text-primary">
                                {s.name}{" "}
                                <span className="text-sm font-bold text-[#b5495b]">{s.points}</span>
                            </p>
                            <p className="mt-0.5 text-sm leading-relaxed text-secondary">{s.detail}</p>
                        </div>
                    ))}
                </div>
            </article>

            <article className="trip-card p-4 sm:p-5">
                <h3 className="font-semibold text-primary">Family Feud</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{GAME_NIGHT.feud}</p>
            </article>

            <article className="trip-card p-4 sm:p-5">
                <h3 className="font-semibold text-primary">Bring</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                    {GAME_NIGHT.equipment.map((item) => (
                        <span
                            key={item}
                            className="rounded-full border border-secondary bg-secondary/80 px-3 py-1.5 text-sm text-secondary"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </article>
        </div>
    );
}
