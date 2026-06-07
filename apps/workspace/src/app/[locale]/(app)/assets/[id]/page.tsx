import { AssetDetailScreen } from "@/domains/assets";

export default async function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssetDetailScreen id={id} />;
}
