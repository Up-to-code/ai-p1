export default function AgTargetSummary({
  title,
  description,
  lines,
}: {
  title: string;
  description: string;
  lines: string[];
}) {
  return (
    <section className="w-full max-w-[420px] rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-slate-400">{description}</p>
      <div className="mt-3 space-y-2">
        {lines.map((line) => (
          <div key={line} className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-200">
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}
