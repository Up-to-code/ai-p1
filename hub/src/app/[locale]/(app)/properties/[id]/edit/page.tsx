import { PropertyFormScreen } from "@/domains/properties";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyFormScreen id={id} />;
}
