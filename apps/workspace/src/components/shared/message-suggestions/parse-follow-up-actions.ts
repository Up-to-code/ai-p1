export type FollowUpAction = {
  label: string;
  prompt: string;
};

export type ParsedFollowUpActions = {
  actions: FollowUpAction[];
};

const FOLLOW_UP_RE = /<follow-up>[\s\S]*?<\/follow-up>/i;
const ACTION_RE = /<action\s+(?:prompt="([^"]*)"\s*)?>([\s\S]*?)<\/action>/gi;

export function parseFollowUpActions(markdown: string): ParsedFollowUpActions | null {
  const match = markdown.match(FOLLOW_UP_RE);
  if (!match) return null;

  const block = match[0];
  const actions: FollowUpAction[] = [];
  let actionMatch;

  while ((actionMatch = ACTION_RE.exec(block)) !== null) {
    const prompt = actionMatch[1] || null;
    const label = actionMatch[2].trim();
    const finalPrompt = prompt || label; // Use prompt attribute if provided, otherwise use label
    
    if (label) {
      actions.push({ label, prompt: finalPrompt });
    }
    if (actions.length >= 3) break; // Limit to 3 actions
  }

  if (actions.length === 0) return null;

  return { actions };
}
