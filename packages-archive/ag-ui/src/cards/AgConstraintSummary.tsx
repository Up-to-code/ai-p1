/**
 * WHY:   Assistants often infer constraints implicitly, and the user needs to see those assumptions in one place.
 * WHAT:  Renders a set of request constraints as small labeled chips.
 * HOW:   Outputs each constraint into a bordered pill-style cell inside a compact summary card.
 */
export default function AgConstraintSummary({
  constraints,
}: {
  constraints: string[];
}) {
  if (constraints.length === 0) return null;

  return (
    <div className="w-full max-w-[380px] border-r-2 border-[color:color-mix(in_srgb,var(--workspace-highlight)_40%,transparent)] py-1 pr-4">
      <div className="text-[10px] font-semibold tracking-wider text-[var(--workspace-highlight)]">فهمت من طلبك</div>
      <p className="mt-1 text-sm font-medium leading-7 text-[var(--workspace-bubble-other-foreground)]">
        {constraints.join("، ")}
      </p>
    </div>
  );
}
