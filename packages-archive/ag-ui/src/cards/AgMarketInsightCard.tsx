/**
 * WHY:   Market-analysis responses need a repeatable card that combines narrative insight with headline metrics.
 * WHAT:  Displays a market insight title, body, and a small grid of labeled metrics.
 * HOW:   Maps each metric into a two-column stat cell beneath the descriptive summary.
 */
export default function AgMarketInsightCard({
  title,
  body,
  metrics,
}: {
  title: string;
  body: string;
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="w-full max-w-[560px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5 text-right shadow-[0_10px_30px_-22px_rgba(0,0,0,0.32)]">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">رؤية سوقية</div>
      <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-7 text-[var(--workspace-muted)]">{body}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-3">
            <div className="text-[10px] font-black tracking-[0.18em] text-[var(--workspace-muted)]">{metric.label}</div>
            <div className="mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{metric.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
