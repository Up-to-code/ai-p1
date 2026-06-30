/**
 * WHY:   When the assistant pauses for more data, the follow-up question needs a stronger visual cue than plain text.
 * WHAT:  Displays a highlighted prompt card for missing data or clarifying follow-up questions.
 * HOW:   Uses a dashed accent frame and icon-led layout to distinguish the card from standard result cards.
 */
export default function AgMissingDataPrompt({
  prompt,
}: {
  prompt: string;
}) {
  return (
    <div className="w-full max-w-[380px] border-r-2 border-[color:color-mix(in_srgb,var(--workspace-highlight)_40%,transparent)] py-1 pr-4">
      <div className="text-[10px] font-semibold tracking-wider text-[var(--workspace-highlight)]">سؤال متابعة</div>
      <p className="mt-1 text-sm font-medium leading-7 text-[var(--workspace-bubble-other-foreground)]">{prompt}</p>
    </div>
  );
}
