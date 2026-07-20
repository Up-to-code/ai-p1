import { CustomAgentEditorScreen } from "@/domains/custom-agents";

export default async function CustomAgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  return <CustomAgentEditorScreen agentId={agentId} />;
}
