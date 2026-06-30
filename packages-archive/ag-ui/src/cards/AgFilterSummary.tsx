export default function AgFilterSummary({
  title,
  filters,
}: {
  title: string;
  filters: string[];
}) {
  if (filters.length === 0) return null;

  return (
    <section className="w-full max-w-[420px] rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="text-[11px] font-semibold tracking-wide text-slate-400">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <span
            key={filter}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200"
          >
            {filter}
          </span>
        ))}
      </div>
    </section>
  );
}
