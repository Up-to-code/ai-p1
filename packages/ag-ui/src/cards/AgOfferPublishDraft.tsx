import AgEntityDraftCard from "./AgEntityDraftCard";

/**
 * WHY:   Offer publication is one of the core assistant-driven tasks and needs a default preview card out of the box.
 * WHAT:  Renders an offer-publication draft using the shared entity-draft primitive.
 * HOW:   Maps publication-specific fields into the generic draft-card field structure.
 */
export default function AgOfferPublishDraft({
  title,
  project,
  unit,
  audience,
  price,
  notes,
}: {
  title: string;
  project: string;
  unit?: string;
  audience: string;
  price: string;
  notes: string;
}) {
  return (
    <AgEntityDraftCard
      kind="offer"
      title={title}
      subtitle="مسودة نشر عرض قبل إرساله إلى السوق أو الوسطاء."
      fields={[
        { label: "المشروع", value: project, emphasized: true },
        { label: "الوحدة", value: unit ?? "على مستوى المشروع بالكامل" },
        { label: "الفئة المستهدفة", value: audience },
        { label: "السعر", value: price },
        { label: "ملخص العرض", value: notes },
      ]}
    />
  );
}
