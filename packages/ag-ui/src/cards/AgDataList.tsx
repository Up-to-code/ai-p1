export default function AgDataList({
  title,
  items,
  emptyLabel = "لا توجد نتائج.",
}: {
  title: string;
  items: Array<{ id: string; title: string; subtitle?: string; meta?: string }>;
  emptyLabel?: string;
}) {
  return (
    <section className="w-full max-w-[420px] rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3">
              <div className="text-xs text-slate-500">{index + 1}</div>
              <div className="mt-1 text-sm font-semibold text-slate-100">{item.title}</div>
              {item.subtitle ? <div className="mt-1 text-xs text-slate-400">{item.subtitle}</div> : null}
              {item.meta ? <div className="mt-2 text-xs text-slate-500">{item.meta}</div> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
