import { IntegrationDetailScreen } from "@/domains/integrations";

export default async function WebAppDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IntegrationDetailScreen id={id} />;
}
