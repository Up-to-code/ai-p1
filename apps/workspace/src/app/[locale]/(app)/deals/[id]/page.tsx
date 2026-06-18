import { DealDetailScreen } from "@/domains/deals";

export default function DealDetailPage({ params }: { params: { id: string } }) {
  return <DealDetailScreen id={params.id} />;
}
