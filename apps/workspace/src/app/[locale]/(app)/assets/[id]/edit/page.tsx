import { AssetFormScreen } from "@/domains/assets";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssetFormScreen id={id} />;
}
