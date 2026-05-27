import type { PromptChipData } from "@/conversation/components/PromptChips";

type PromptLocale = "ar" | "en" | "fr";

type WorkspacePrompt = {
  id: string;
  name: string;
  tag: string;
  query: string;
};

const WORKSPACE_PROMPTS: Record<PromptLocale, WorkspacePrompt[]> = {
  ar: [
    {
      id: "project_plan",
      name: "خطة مشروع",
      tag: "تنظيم وتنفيذ",
      query: "حوّل هذه الفكرة إلى خطة مشروع واضحة مع مهام وخطوات متابعة",
    },
    {
      id: "team_update",
      name: "تحديث فريق",
      tag: "ملخص وإجراءات",
      query: "لخص آخر تطورات مساحة العمل وحدد أهم الإجراءات التالية",
    },
    {
      id: "calendar",
      name: "تقويم",
      tag: "مواعيد واجتماعات",
      query: "ساعدني في ترتيب اجتماع ومتابعة الموعد داخل مساحة العمل",
    },
    {
      id: "tasks",
      name: "مهام",
      tag: "أولويات",
      query: "استخرج قائمة مهام مرتبة بالأولوية من هذه المحادثة",
    },
    {
      id: "invite_member",
      name: "دعوة عضو",
      tag: "منظمة وأمان",
      query: "ساعدني في دعوة عضو جديد لمساحة العمل مع الصلاحيات المناسبة",
    },
  ],
  en: [
    {
      id: "project_plan",
      name: "Project plan",
      tag: "Tasks and follow-up",
      query: "Turn this idea into a clear workspace project plan with tasks and next steps",
    },
    {
      id: "team_update",
      name: "Team update",
      tag: "Summary and actions",
      query: "Summarize the latest workspace activity and identify the next actions",
    },
    {
      id: "calendar",
      name: "Calendar",
      tag: "Meetings",
      query: "Help me schedule a meeting and track the follow-up inside the workspace",
    },
    {
      id: "tasks",
      name: "Tasks",
      tag: "Priorities",
      query: "Extract a prioritized task list from this conversation",
    },
    {
      id: "invite_member",
      name: "Invite member",
      tag: "Organization",
      query: "Help me invite a new member to the workspace with the right permissions",
    },
  ],
  fr: [
    {
      id: "project_plan",
      name: "Plan projet",
      tag: "Taches et suivi",
      query: "Transforme cette idee en plan de projet clair avec des taches et prochaines etapes",
    },
    {
      id: "team_update",
      name: "Point equipe",
      tag: "Resume et actions",
      query: "Resume l'activite recente de l'espace de travail et identifie les prochaines actions",
    },
    {
      id: "calendar",
      name: "Calendrier",
      tag: "Reunions",
      query: "Aide-moi a planifier une reunion et le suivi dans l'espace de travail",
    },
    {
      id: "tasks",
      name: "Taches",
      tag: "Priorites",
      query: "Extrais une liste de taches prioritaires depuis cette conversation",
    },
    {
      id: "invite_member",
      name: "Inviter",
      tag: "Organisation",
      query: "Aide-moi a inviter un nouveau membre avec les bonnes permissions",
    },
  ],
};

export const EDITING_COPY: Record<PromptLocale, { label: string; cancel: string }> = {
  ar: { label: "تعديل الرسالة", cancel: "إلغاء" },
  en: { label: "Editing message", cancel: "Cancel" },
  fr: { label: "Modification du message", cancel: "Annuler" },
};

export function getPreparedWorkspacePrompts(
  locale: PromptLocale,
  setDraftText: (value: string) => void,
): PromptChipData[] {
  return WORKSPACE_PROMPTS[locale].map((prompt) => ({
    id: prompt.id,
    label: prompt.name,
    tag: prompt.tag,
    onPress: () => setDraftText(prompt.query),
  }));
}
