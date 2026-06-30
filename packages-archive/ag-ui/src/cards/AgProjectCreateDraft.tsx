import AgEntityDraftCard from "./AgEntityDraftCard";

/**
 * WHY:   Project creation is a primary agent task and needs a default draft preview that hosts can use immediately.
 * WHAT:  Renders a create-project draft using the shared entity-draft card.
 * HOW:   Maps project-specific fields into the generic entity-draft layout.
 */
export default function AgProjectCreateDraft({
  name,
  owner,
  workspace,
  budget,
  timeline,
  resources,
  summary,
}: {
  name: string;
  owner: string;
  workspace: string;
  budget: string;
  timeline: string;
  resources: string;
  summary: string;
}) {
  return (
    <AgEntityDraftCard
      kind="project"
      title={name}
      subtitle="المساعد جمع هذه البيانات من المحادثة ليجهز إنشاء المشروع."
      fields={[
        { label: "المالك", value: owner },
        { label: "المساحة", value: workspace },
        { label: "الميزانية", value: budget, emphasized: true },
        { label: "الجدول الزمني", value: timeline },
        { label: "الأصول", value: resources },
        { label: "الوصف", value: summary },
      ]}
    />
  );
}
