import type {
  AssistantDirection,
  AssistantStageEvent,
  AssistantSurfaceCopy,
  AssistantTurn,
  AssistantUiLocale,
  ThreadPresentation,
} from "@/conversation/assistantProtocol";
import type { StreamState } from "@/types/domain";
import { detectDeviceLocale, resolveEffectiveLocale } from "@/foundation/localization/core";
import {
  getCuratedAssistantSurfaceCopy,
  resolveAssistantSurfaceCopy,
  resolveDirectionFromLanguageTag,
  resolveUiLocaleFromLanguageTag,
} from "@/conversation/assistantProtocol";
import type { AgentRuntimeHealth } from "@/types/domain";
import { useAppStore } from "@/store";

type ResolvedThreadPresentation = ThreadPresentation & {
  surfaceCopy: AssistantSurfaceCopy;
};

export function getDeviceLocale(): AssistantUiLocale {
  const preference = useAppStore.getState().localePreference;
  return resolveEffectiveLocale(preference, detectDeviceLocale());
}

export function buildFallbackThreadPresentation(): ResolvedThreadPresentation {
  const uiLocale = getDeviceLocale();
  const languageTag = uiLocale;
  return {
    languageTag,
    direction: resolveDirectionFromLanguageTag(languageTag),
    uiLocale,
    source: "detected",
    confidence: 0.5,
    surfaceCopy: getCuratedAssistantSurfaceCopy(uiLocale),
  };
}

export function resolveThreadPresentationState(
  presentation?: ThreadPresentation | null,
): ResolvedThreadPresentation {
  const fallback = buildFallbackThreadPresentation();
  const languageTag = presentation?.languageTag ?? fallback.languageTag;
  const uiLocale =
    presentation?.uiLocale ?? resolveUiLocaleFromLanguageTag(languageTag) ?? fallback.uiLocale;

  return {
    languageTag,
    direction: presentation?.direction ?? resolveDirectionFromLanguageTag(languageTag),
    uiLocale,
    source: presentation?.source ?? fallback.source,
    confidence: presentation?.confidence ?? fallback.confidence,
    surfaceCopy: resolveAssistantSurfaceCopy({
      ...presentation,
      languageTag,
      uiLocale,
    }),
  };
}

export function resolveAssistantDirection(args: {
  turnPresentation?: Pick<ThreadPresentation, "direction"> | null;
  threadPresentation?: Pick<ThreadPresentation, "direction"> | null;
  fallbackText?: string;
}): AssistantDirection {
  if (args.turnPresentation?.direction) {
    return args.turnPresentation.direction;
  }

  if (args.threadPresentation?.direction) {
    return args.threadPresentation.direction;
  }

  const text = args.fallbackText?.trim() ?? "";
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text) ? "rtl" : "ltr";
}

export function isRtlDirection(direction: AssistantDirection) {
  return direction === "rtl";
}

export function getLocalizedRouteLabel(
  route: AssistantStageEvent["route"] | undefined,
  copy: AssistantSurfaceCopy,
) {
  switch (route) {
    case "property":
      return copy.routeProperty;
    case "funding":
      return copy.routeFunding;
    case "legal":
      return copy.routeLegal;
    case "mixed":
      return copy.routeMixed;
    case "advisor":
    default:
      return copy.routeAdvisor;
  }
}

type AssistantIdentityKind =
  | "advisor"
  | "search"
  | "compare"
  | "save"
  | "finance"
  | "legal"
  | "mixed";

const AGENT_IDENTITY_LABELS: Record<
  AssistantUiLocale,
  Record<AssistantIdentityKind, { brand: string; suffix: string }>
> = {
  ar: {
    advisor: { brand: "Zane", suffix: "المستشار" },
    search: { brand: "Zane", suffix: "البحث" },
    compare: { brand: "Zane", suffix: "المقارنة" },
    save: { brand: "Zane", suffix: "الحفظ" },
    finance: { brand: "Zane", suffix: "التمويل" },
    legal: { brand: "Zane", suffix: "القانوني" },
    mixed: { brand: "Zane", suffix: "البحث والتمويل" },
  },
  en: {
    advisor: { brand: "ZANE", suffix: "ADVISOR" },
    search: { brand: "ZANE", suffix: "SEARCH" },
    compare: { brand: "ZANE", suffix: "COMPARE" },
    save: { brand: "ZANE", suffix: "SAVE" },
    finance: { brand: "ZANE", suffix: "FINANCE" },
    legal: { brand: "ZANE", suffix: "LEGAL" },
    mixed: { brand: "ZANE", suffix: "SEARCH + FINANCE" },
  },
  fr: {
    advisor: { brand: "ZANE", suffix: "CONSEIL" },
    search: { brand: "ZANE", suffix: "RECHERCHE" },
    compare: { brand: "ZANE", suffix: "COMPARAISON" },
    save: { brand: "ZANE", suffix: "ENREGISTREMENT" },
    finance: { brand: "ZANE", suffix: "FINANCEMENT" },
    legal: { brand: "ZANE", suffix: "JURIDIQUE" },
    mixed: { brand: "ZANE", suffix: "RECHERCHE + FINANCEMENT" },
  },
};

function getIdentityLocale(presentation?: Pick<ThreadPresentation, "uiLocale" | "languageTag"> | null) {
  return presentation?.uiLocale
    ?? resolveUiLocaleFromLanguageTag(presentation?.languageTag)
    ?? getDeviceLocale();
}

function inferAssistantIdentityKind(args: {
  route?: AssistantStageEvent["route"];
  stageSpecialist?: string;
  turn?: Pick<AssistantTurn, "route" | "blocks" | "actions"> | null;
}): AssistantIdentityKind {
  const turn = args.turn;
  if (turn?.blocks.some((block) => block.type === "comparison")) {
    return "compare";
  }

  const actionIds = new Set(
    turn?.blocks
      .filter((block) => block.type === "actions")
      .flatMap((block) => block.actionIds) ?? [],
  );
  if (turn?.actions.some((action) => action.name === "save_property" && actionIds.has(action.id))) {
    return "save";
  }

  if (turn?.blocks.some((block) => block.type === "property_list")) {
    return "search";
  }

  const route = turn?.route ?? args.route;
  if (route === "legal" || args.stageSpecialist === "legal") {
    return "legal";
  }
  if (route === "funding" || args.stageSpecialist === "funding") {
    return "finance";
  }
  if (route === "mixed") {
    return "mixed";
  }
  if (route === "property" || args.stageSpecialist === "property") {
    return "search";
  }
  return "advisor";
}

export function resolveAssistantIdentityLabel(args: {
  threadPresentation?: Pick<ThreadPresentation, "uiLocale" | "languageTag"> | null;
  route?: AssistantStageEvent["route"];
  stageSpecialist?: string;
  turn?: Pick<AssistantTurn, "route" | "blocks" | "actions"> | null;
}) {
  const locale = getIdentityLocale(args.threadPresentation);
  const kind = inferAssistantIdentityKind(args);
  const label = AGENT_IDENTITY_LABELS[locale][kind];
  return `${label.brand} ${label.suffix}`.trim();
}

type AssistantBrandActivityKind =
  | "thinking"
  | "searching"
  | "comparing"
  | "saving"
  | "finance"
  | "reviewing"
  | "stopping";

type AssistantBrandActivityState = {
  label: string | null;
  animate: boolean;
  logoMotion: boolean;
  textMotion: "none" | "light_sweep";
  emphasis: "quiet" | "active" | "stopping";
};

const ASSISTANT_BRAND_ACTIVITY_LABELS: Record<
  AssistantUiLocale,
  Record<AssistantBrandActivityKind, string>
> = {
  ar: {
    thinking: "يفكر",
    searching: "يبحث",
    comparing: "يقارن",
    saving: "يحفظ",
    finance: "يحلل التمويل",
    reviewing: "يراجع",
    stopping: "يتوقف",
  },
  en: {
    thinking: "Thinking",
    searching: "Searching",
    comparing: "Comparing",
    saving: "Saving",
    finance: "Analyzing finance",
    reviewing: "Reviewing",
    stopping: "Stopping",
  },
  fr: {
    thinking: "Réflexion",
    searching: "Recherche",
    comparing: "Comparaison",
    saving: "Enregistrement",
    finance: "Analyse financement",
    reviewing: "Révision",
    stopping: "Arrêt",
  },
};

function inferAssistantBrandActivityKind(args: {
  route?: AssistantStageEvent["route"];
  stageSpecialist?: string;
  phase?: AssistantStageEvent["phase"];
  turn?: Pick<AssistantTurn, "route" | "blocks" | "actions"> | null;
}): AssistantBrandActivityKind {
  const turn = args.turn;

  if (turn?.blocks.some((block) => block.type === "comparison")) {
    return "comparing";
  }

  const actionIds = new Set(
    turn?.blocks
      .filter((block) => block.type === "actions")
      .flatMap((block) => block.actionIds) ?? [],
  );
  if (turn?.actions.some((action) => action.name === "save_property" && actionIds.has(action.id))) {
    return "saving";
  }

  if (args.stageSpecialist === "funding" || turn?.route === "funding" || args.route === "funding") {
    return "finance";
  }

  if (args.stageSpecialist === "legal" || turn?.route === "legal" || args.route === "legal") {
    return "reviewing";
  }

  if (
    args.stageSpecialist === "property"
    || turn?.route === "property"
    || turn?.route === "mixed"
    || args.route === "property"
    || args.route === "mixed"
  ) {
    return "searching";
  }

  if (
    args.phase === "classify_started"
    || args.phase === "summary_started"
    || args.phase === "persist_started"
    || args.stageSpecialist === "orchestrator"
    || args.stageSpecialist === "summary"
  ) {
    return "thinking";
  }

  return "thinking";
}

export function resolveAssistantBrandActivity(args: {
  threadPresentation?: Pick<ThreadPresentation, "uiLocale" | "languageTag"> | null;
  route?: AssistantStageEvent["route"];
  stageSpecialist?: string;
  phase?: AssistantStageEvent["phase"];
  stageStatus?: AssistantStageEvent["status"];
  turn?: Pick<AssistantTurn, "route" | "blocks" | "actions"> | null;
  streamState?: StreamState;
}): AssistantBrandActivityState {
  const locale = getIdentityLocale(args.threadPresentation);
  const isStopping = args.streamState === "stopped" || args.stageStatus === "cancelled";
  const isActive = args.streamState === "streaming" || args.stageStatus === "running";

  if (isStopping) {
    return {
      label: ASSISTANT_BRAND_ACTIVITY_LABELS[locale].stopping,
      animate: false,
      logoMotion: false,
      textMotion: "none",
      emphasis: "stopping",
    };
  }

  if (!isActive) {
    return {
      label: null,
      animate: false,
      logoMotion: false,
      textMotion: "none",
      emphasis: "quiet",
    };
  }

  const kind = inferAssistantBrandActivityKind(args);
  return {
    label: ASSISTANT_BRAND_ACTIVITY_LABELS[locale][kind],
    animate: true,
    logoMotion: true,
    textMotion: "light_sweep",
    emphasis: "active",
  };
}

export function getLocalizedStageMessage(
  event: AssistantStageEvent | undefined,
  copy: AssistantSurfaceCopy,
) {
  switch (event?.phase) {
    case "classify_started":
      return copy.stageClassifyStarted;
    case "classify_done":
      return copy.stageClassifyDone;
    case "specialist_started":
      return copy.stageSpecialistStarted;
    case "specialist_done":
      return copy.stageSpecialistDone;
    case "summary_started":
      return copy.stageSummaryStarted;
    case "summary_done":
      return copy.stageSummaryDone;
    case "persist_started":
      return copy.stagePersistStarted;
    case "persist_done":
      return copy.stagePersistDone;
    default:
      return event?.message ?? copy.runtimeChecking;
  }
}

export function getLocalizedRuntimeMessage(
  runtimeHealth: AgentRuntimeHealth,
  copy: AssistantSurfaceCopy,
) {
  if (runtimeHealth.status !== "unavailable") {
    return runtimeHealth.message;
  }

  if (!runtimeHealth.llm?.configured) {
    return copy.runtimeMissingLlm;
  }

  if (runtimeHealth.worker?.available === false) {
    return copy.runtimeWorkerOffline;
  }

  return runtimeHealth.message ?? copy.aiUnavailableBody;
}
