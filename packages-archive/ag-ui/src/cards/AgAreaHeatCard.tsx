/**
 * WHY:   Market analysis turns need a compact way to show locality heat without forcing the host to design one.
 * WHAT:  Displays an area, city, and temperature-style demand label with a short summary.
 * HOW:   Maps the `heat` value onto a tone preset and renders a small bordered card.
 */
export default function AgAreaHeatCard({
  city,
  area,
  heat,
  summary,
}: {
  city: string;
  area: string;
  heat: "hot" | "warm" | "cold";
  summary: string;
}) {
  const tone =
    heat === "hot"
      ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
      : heat === "warm"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
        : "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]";

  return (
    <section className="w-full max-w-[520px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5 text-right shadow-[0_10px_30px_-22px_rgba(0,0,0,0.32)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black tracking-[0.18em] text-[var(--workspace-muted)]">{city}</div>
          <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{area}</h3>
        </div>
        <div className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.18em] ${tone}`}>
          {heat === "hot" ? "ساخن" : heat === "warm" ? "متوازن" : "بارد"}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium leading-7 text-[var(--workspace-muted)]">{summary}</p>
    </section>
  );
}
