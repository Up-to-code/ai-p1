export type AssistantDirection = "ltr" | "rtl";
export type AssistantUiLocale = "ar" | "en" | "fr";
export type AssistantRoute = "advisor" | "property" | "funding" | "legal" | "mixed";

export type AssistantSurfaceCopy = {
  [key: string]: string;
  routeAdvisor: string;
  routeProperty: string;
  routeFunding: string;
  routeLegal: string;
  routeMixed: string;
  stageClassifyStarted: string;
  stageClassifyDone: string;
  stageSpecialistStarted: string;
  stageSpecialistDone: string;
  stageSummaryStarted: string;
  stageSummaryDone: string;
  stagePersistStarted: string;
  stagePersistDone: string;
  stageFallback: string;
  runtimeChecking: string;
  aiUnavailableBody: string;
  runFailedTitle: string;
  composerPlaceholder: string;
};

export type ThreadPresentation = {
  languageTag: string;
  direction: AssistantDirection;
  uiLocale?: AssistantUiLocale | null;
  source: "detected" | "explicit" | "fallback";
  confidence: number;
};

export type AssistantSource = {
  title: string;
  url: string;
  snippet: string;
};

export type AssistantAction = {
  id: string;
  title: string;
  name:
    | "open_search"
    | "open_property"
    | "contact_agent"
    | "schedule_visit"
    | "save_property"
    | "continue_thread"
    | string;
  payload: any;
};

type BaseBlock = {
  [key: string]: any;
  id: string;
  title?: string;
  suggestions?: string[];
};

export type AssistantBlock =
  | (BaseBlock & { type: "text"; body: string })
  | (BaseBlock & { type: "property_list"; propertyIds: string[]; searchQuery?: string; querySummary?: string })
  | (BaseBlock & { type: "comparison"; propertyIds: string[]; points: string[] })
  | (BaseBlock & { type: "sources"; sources: AssistantSource[] })
  | (BaseBlock & { type: "followup"; prompt: string })
  | (BaseBlock & { type: "funding_options"; summary: string; options: string[]; disclaimers?: string[] })
  | (BaseBlock & { type: "advisor_note"; body: string; bullets?: string[] })
  | (BaseBlock & { type: "actions"; actionIds: string[] })
  | (BaseBlock & { type: "empty"; body: string });

export type AssistantStageEvent = {
  [key: string]: any;
  route?: AssistantRoute;
  specialist?: string;
  motionPreset?: AssistantTurn["motion"]["preset"];
  message?: string;
  phase?:
    | "classify_started"
    | "classify_done"
    | "specialist_started"
    | "specialist_done"
    | "summary_started"
    | "summary_done"
    | "persist_started"
    | "persist_done";
  status?: "running" | "completed" | "cancelled" | "failed";
};

export type AssistantTurn = {
  version: "assistant_turn.v1";
  route: AssistantRoute;
  status: "completed" | "streaming" | "failed";
  assistantText?: string;
  blocks: AssistantBlock[];
  actions: AssistantAction[];
  agent?: {
    primaryAgent: string;
    participatingAgents: string[];
    handoffs: string[];
    [key: string]: any;
  };
  motion: {
    preset: "assistant" | "advisor" | "property" | "funding" | "legal" | "mixed";
    [key: string]: any;
  };
  presentation?: ThreadPresentation | null;
  [key: string]: any;
};

const surfaceCopy: Record<AssistantUiLocale, AssistantSurfaceCopy> = {
  ar: {
    routeAdvisor: "مستشار",
    routeProperty: "عقارات",
    routeFunding: "تمويل",
    routeLegal: "قانوني",
    routeMixed: "بحث وتمويل",
    stageClassifyStarted: "يفهم الطلب",
    stageClassifyDone: "فهم الطلب",
    stageSpecialistStarted: "يجهز الإجابة",
    stageSpecialistDone: "جهز الإجابة",
    stageSummaryStarted: "يلخص",
    stageSummaryDone: "لخص",
    stagePersistStarted: "يحفظ السياق",
    stagePersistDone: "حفظ السياق",
    stageFallback: "يعمل",
    runtimeChecking: "يتحقق من الاتصال",
    aiUnavailableBody: "المساعد غير متاح الآن.",
    runFailedTitle: "تعذر تشغيل المساعد",
    composerPlaceholder: "اسأل Zane عن العقارات",
  },
  en: {
    routeAdvisor: "Advisor",
    routeProperty: "Property",
    routeFunding: "Funding",
    routeLegal: "Legal",
    routeMixed: "Search + funding",
    stageClassifyStarted: "Reading request",
    stageClassifyDone: "Request understood",
    stageSpecialistStarted: "Preparing answer",
    stageSpecialistDone: "Answer prepared",
    stageSummaryStarted: "Summarizing",
    stageSummaryDone: "Summarized",
    stagePersistStarted: "Saving context",
    stagePersistDone: "Context saved",
    stageFallback: "Working",
    runtimeChecking: "Checking connection",
    aiUnavailableBody: "The assistant is unavailable right now.",
    runFailedTitle: "Assistant run failed",
    composerPlaceholder: "Ask Zane about real estate",
  },
  fr: {
    routeAdvisor: "Conseil",
    routeProperty: "Bien",
    routeFunding: "Financement",
    routeLegal: "Juridique",
    routeMixed: "Recherche + financement",
    stageClassifyStarted: "Lecture de la demande",
    stageClassifyDone: "Demande comprise",
    stageSpecialistStarted: "Préparation",
    stageSpecialistDone: "Préparé",
    stageSummaryStarted: "Résumé",
    stageSummaryDone: "Résumé prêt",
    stagePersistStarted: "Sauvegarde du contexte",
    stagePersistDone: "Contexte sauvegardé",
    stageFallback: "En cours",
    runtimeChecking: "Vérification de la connexion",
    aiUnavailableBody: "L’assistant n’est pas disponible pour le moment.",
    runFailedTitle: "Échec de l’assistant",
    composerPlaceholder: "Demandez à Zane",
  },
};

export function resolveDirectionFromLanguageTag(languageTag?: string | null): AssistantDirection {
  if (!languageTag) return "ltr";
  const normalized = languageTag.toLowerCase();
  if (normalized.startsWith("ar-latn")) return "ltr";
  return normalized.startsWith("ar") ? "rtl" : "ltr";
}

export function resolveUiLocaleFromLanguageTag(languageTag?: string | null): AssistantUiLocale | null {
  if (!languageTag) return null;
  const normalized = languageTag.toLowerCase();
  if (normalized.startsWith("ar-latn")) return null;
  if (normalized.startsWith("ar")) return "ar";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("en")) return "en";
  return null;
}

export function isSupportedAssistantUiLocale(value: unknown): value is AssistantUiLocale {
  return value === "ar" || value === "en" || value === "fr";
}

export function getCuratedAssistantSurfaceCopy(locale: AssistantUiLocale) {
  return surfaceCopy[locale];
}

export function resolveAssistantSurfaceCopy(presentation?: Pick<ThreadPresentation, "uiLocale" | "languageTag"> | null) {
  const locale = presentation?.uiLocale ?? resolveUiLocaleFromLanguageTag(presentation?.languageTag) ?? "en";
  return surfaceCopy[locale];
}

export function extractTurnPropertyIds(turn: Pick<AssistantTurn, "blocks">) {
  return turn.blocks.flatMap((block) =>
    block.type === "property_list" || block.type === "comparison" ? block.propertyIds : [],
  );
}

export function extractTurnSources(turn: Pick<AssistantTurn, "blocks">) {
  return turn.blocks.flatMap((block) => (block.type === "sources" ? block.sources : []));
}

export const assistantStageEventSchema = {
  parse(value: AssistantStageEvent) {
    return value;
  },
};

export const assistantTurnSchema = {
  safeParse(value: AssistantTurn) {
    try {
      return { success: true as const, data: this.parse(value) };
    } catch (error) {
      return { success: false as const, error };
    }
  },
  parse(value: AssistantTurn) {
    const actions = value.actions ?? [];
    for (const action of actions) {
      if (action.name === "open_property" && typeof action.payload?.propertyId !== "string") {
        throw new Error("open_property actions require payload.propertyId");
      }
    }
    return value;
  },
};
