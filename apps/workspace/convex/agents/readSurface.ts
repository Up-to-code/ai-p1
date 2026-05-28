import { revealOrganizationText } from "../security/organizationData";

type AgentRecord = {
  _id: string;
};

type AgentMessageRecord = AgentRecord & {
  organizationId: string;
  encryptedContent?: string;
  content: string;
  contentRedacted?: boolean;
};

type AgentPage<TRecord> = {
  page: TRecord[];
  isDone: boolean;
  continueCursor: string;
};

type TextReveal = (
  organizationId: string,
  purpose: string,
  encryptedText: string | undefined,
  fallbackText: string,
) => Promise<string>;

export function boundedAgentReadLimit(limit: number | undefined, fallback: number, max: number) {
  return Math.max(1, Math.min(limit ?? fallback, max));
}

export function presentAgentRecord<TRecord extends AgentRecord>(record: TRecord) {
  return { ...record, id: record._id };
}

export function presentAgentThreadPage<TRecord extends AgentRecord>(page: AgentPage<TRecord>) {
  return {
    threads: page.page.map(presentAgentRecord),
    isDone: page.isDone,
    continueCursor: page.continueCursor,
  };
}

export async function presentAgentMessage<TMessage extends AgentMessageRecord>(
  message: TMessage,
  reveal: TextReveal = revealOrganizationText,
) {
  const { encryptedContent: _encryptedContent, contentRedacted: _contentRedacted, ...safeMessage } = message;
  return {
    ...safeMessage,
    id: message._id,
    content: await reveal(message.organizationId, "agent-message", _encryptedContent, message.content),
  };
}

export function chronologicalAgentMessages<TMessage>(messagesNewestFirst: TMessage[]) {
  return messagesNewestFirst.reverse();
}

export function revealAgentText(
  organizationId: string,
  purpose: string,
  encryptedText: string | undefined,
  fallbackText: string,
) {
  return revealOrganizationText(organizationId, purpose, encryptedText, fallbackText);
}
