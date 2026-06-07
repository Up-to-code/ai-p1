import { OpportunityDetailScreen } from "@/domains/opportunities/components/opportunities-screen";

export default async function OpportunityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetailScreen id={id} />;
}

