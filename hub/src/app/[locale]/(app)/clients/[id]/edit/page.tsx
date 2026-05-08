import { ClientFormScreen } from "@/domains/clients";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientFormScreen id={id} />;
}
