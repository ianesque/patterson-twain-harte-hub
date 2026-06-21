import { ACTIVITY_MENU, GAME_NIGHT, LOCAL_GEMS } from "@/data/trip-content";
import { PanelHeader, PhoneLine, TripBadge } from "@/components/trip/trip-ui";

const ACCENTS = ["", "sage", "amber"] as const;

function ActivityCardGrid({ cards, accentIndex = 0 }: { cards: typeof ACTIVITY_MENU; accentIndex?: number }) {
    const accent = ACCENTS[accentIndex % ACCENTS.length];

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
                <article
                    key={card.title}
                    className="trip-card trip-ref-card flex flex-col p-4 sm:p-5"
                    data-accent={accent || undefined}
                >
                    <h4 className="text-[var(--trip-title-card)] font-semibold leading-snug tracking-tight text-primary">{card.title}</h4>
                    <p className="mt-1.5 text-[var(--trip-body-sm)] font-bold text-[var(--trip-sage)]">{card.distance}</p>
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

export function ActivitiesReferencePanel({ embedded }: { embedded?: boolean } = {}) {
    return (
        <div className="space-y-6">
            {!embedded && (
                <PanelHeader title="Day trips" description="Most are within 45 minutes. Knights Ferry is ~1 hour each way." />
            )}
            {embedded && <p className="trip-section-desc">Most are within 45 minutes. Knights Ferry is ~1 hour each way.</p>}
            <ActivityCardGrid cards={ACTIVITY_MENU} />
            <p className="trip-callout">Book Pinecrest boats early — two boats if all 20 want to go together.</p>
        </div>
    );
}

export function GemsReferencePanel({ embedded }: { embedded?: boolean } = {}) {
    return (
        <div className="space-y-8">
            {!embedded && <PanelHeader title="Extras" description="Evenings, backups, and side trips." />}
            {LOCAL_GEMS.map((group, index) => (
                <section key={group.section}>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--trip-sage)]">{group.section}</h3>
                    <ActivityCardGrid cards={group.cards} accentIndex={index + 1} />
                </section>
            ))}
        </div>
    );
}

export function GameNightReferencePanel({ embedded }: { embedded?: boolean } = {}) {
    return (
        <div className="space-y-6">
            {!embedded && <PanelHeader title="Game Night" description={GAME_NIGHT.intro} />}
            {embedded && <p className="trip-section-desc">{GAME_NIGHT.intro}</p>}

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
                                <span className="text-sm font-bold text-[var(--trip-warning)]">{s.points}</span>
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
