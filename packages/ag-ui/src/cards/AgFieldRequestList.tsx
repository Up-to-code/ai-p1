/**
 * WHY:   Partial draft turns should clearly show which inputs are still missing before execution can continue.
 * WHAT:  Displays a title and a list of missing fields that the user or host still needs to provide.
 * HOW:   Renders each requested field as a bordered row inside a compact data-collection card.
 */
export default function AgFieldRequestList({
  title = "ما زالت هناك بيانات ناقصة",
  fields,
}: {
  title?: string;
  fields: string[];
}) {
  if (fields.length === 0) return null;

  const nextField = fields[0];
  const remainingCount = fields.length - 1;

  return (
    <div className="w-full max-w-[380px]">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">جمع البيانات</div>
      <p className="mt-1.5 text-sm font-bold leading-7 text-[var(--workspace-bubble-other-foreground)]">{title}</p>
      <div className="mt-3 rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] px-4 py-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">
        {nextField}
      </div>
      {remainingCount > 0 ? (
        <div className="mt-2 text-[11px] font-medium text-[var(--workspace-muted)]">
          + {remainingCount} معلومات أخرى سنسألك عنها لاحقًا
        </div>
      ) : null}
    </div>
  );
}
