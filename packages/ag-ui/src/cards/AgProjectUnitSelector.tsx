/**
 * WHY:   Some workflows need a compact view of the selected project and unit options before an action is executed.
 * WHAT:  Displays a project name plus the available unit labels, highlighting the selected one.
 * HOW:   Renders each unit as a small pill and applies a distinct tone to the selected label.
 */
export default function AgProjectUnitSelector({
  project,
  units,
  selectedLabel,
}: {
  project: string;
  units: string[];
  selectedLabel?: string;
}) {
  return (
    <section className="w-full max-w-[340px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">اختيار المشروع والوحدة</div>
      <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{project}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {units.map((unit) => (
          <div
            key={unit}
            className={
              unit === selectedLabel
                ? "rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] px-3 py-2 text-xs font-black text-[var(--workspace-highlight)]"
                : "rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2 text-xs font-bold text-[var(--workspace-muted)]"
            }
          >
            {unit}
          </div>
        ))}
      </div>
    </section>
  );
}
