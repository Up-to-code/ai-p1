import AgEntityDraftCard from "./AgEntityDraftCard";

/**
 * WHY:   Sending an offer to a recipient needs a preview step before the host actually performs the transport action.
 * WHAT:  Renders the offer-send draft with recipient, context, message, and next-action details.
 * HOW:   Reuses the entity-draft card and supplies the send-specific field mapping.
 */
export default function AgOfferSendDraft({
  recipient,
  project,
  unit,
  message,
  action,
}: {
  recipient: string;
  project: string;
  unit?: string;
  message: string;
  action: string;
}) {
  return (
    <AgEntityDraftCard
      kind="offer"
      title={`إرسال عرض إلى ${recipient}`}
      subtitle="المساعد جهز محتوى الإرسال والخطوة التالية قبل التنفيذ."
      fields={[
        { label: "المشروع", value: project, emphasized: true },
        { label: "الوحدة", value: unit ?? "بدون تحديد وحدة" },
        { label: "نص الرسالة", value: message },
        { label: "الإجراء التالي", value: action },
      ]}
    />
  );
}
