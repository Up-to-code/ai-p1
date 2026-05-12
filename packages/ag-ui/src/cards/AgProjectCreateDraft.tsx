import AgEntityDraftCard from "./AgEntityDraftCard";

/**
 * WHY:   Project creation is a primary agent task and needs a default draft preview that hosts can use immediately.
 * WHAT:  Renders a create-project draft using the shared entity-draft card.
 * HOW:   Maps project-specific fields into the generic entity-draft layout.
 */
export default function AgProjectCreateDraft({
  name,
  city,
  district,
  price,
  brokerFee,
  rooms,
  bathrooms,
  summary,
}: {
  name: string;
  city: string;
  district: string;
  price: string;
  brokerFee: string;
  rooms: string;
  bathrooms: string;
  summary: string;
}) {
  return (
    <AgEntityDraftCard
      kind="project"
      title={name}
      subtitle="المساعد جمع هذه البيانات من المحادثة ليجهز إنشاء المشروع."
      fields={[
        { label: "المدينة", value: city },
        { label: "الحي", value: district },
        { label: "السعر المبدئي", value: price, emphasized: true },
        { label: "عمولة الوسيط", value: brokerFee },
        { label: "الغرف / الحمامات", value: `${rooms} غرف - ${bathrooms} حمامات` },
        { label: "الوصف", value: summary },
      ]}
    />
  );
}
