import { PropertyDetailScreen } from "@/domains/properties";

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyDetailScreen id={id} />;
}
