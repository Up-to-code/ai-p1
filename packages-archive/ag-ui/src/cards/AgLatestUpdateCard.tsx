/**
 * WHY:   Status-oriented turns need a focused “what changed recently” visual without requiring host-specific UI.
 * WHAT:  Displays an entity headline plus a short list of recent updates.
 * HOW:   Renders the entity title, headline, and each detail item in stacked bordered rows.
 */
export default function AgLatestUpdateCard({
  entity,
  headline,
  details,
}: {
  entity: string;
  headline: string;
  details: string[];
}) {
  return (
    <section className="w-full max-w-[560px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5 text-right shadow-[0_10px_30px_-22px_rgba(0,0,0,0.32)]">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">آخر تحديث</div>
      <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{entity}</h3>
      <p className="mt-2 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">{headline}</p>
      <div className="mt-4 grid gap-2">
        {details.map((detail) => (
          <div key={detail} className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-3 text-sm font-medium text-[var(--workspace-muted)]">
            {detail}
          </div>
        ))}
      </div>
    </section>
  );
}
