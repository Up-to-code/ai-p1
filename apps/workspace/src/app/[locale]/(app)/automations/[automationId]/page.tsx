import { AutomationsScreen } from "@/domains/automations";

export default async function AutomationPage({
  params,
}: {
  params: Promise<{ automationId: string }>;
}) {
  const { automationId } = await params;
  return <AutomationsScreen automationId={automationId} />;
}
