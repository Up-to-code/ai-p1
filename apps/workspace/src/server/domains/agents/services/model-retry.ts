import type { AgentResponseLanguage } from "./agent-language";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRequestId(message: string) {
  return message.match(/Request ID:\s*([A-Za-z0-9_-]+)/i)?.[1] ?? null;
}

function isRetryableModelError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const status = (error as { status?: unknown; statusCode?: unknown; code?: unknown } | null)?.status
    ?? (error as { status?: unknown; statusCode?: unknown; code?: unknown } | null)?.statusCode
    ?? (error as { status?: unknown; statusCode?: unknown; code?: unknown } | null)?.code;

  if (typeof status === "number") {
    if (status === 401 || status === 403) return false;
    if (status === 400 && !/(model|not found|invalid|unsupported|retired|shut\s*down|unavailable)/i.test(message)) {
      return false;
    }
    if (status === 408 || status === 409 || status === 429 || status >= 500) return true;
  }

  return /(server error|request id|overloaded|temporar(?:y|ily)|timeout|timed out|rate limit|429|5\d\d|model.*(?:not found|invalid|unsupported|retired|shut\s*down|unavailable)|no endpoints?|provider.*unavailable)/i.test(message);
}

function startupFailureMessage(error: unknown, language: AgentResponseLanguage = "en") {
  const raw = error instanceof Error ? error.message : String(error ?? "Agent request failed.");
  const requestId = extractRequestId(raw);

  if (/no session|unauthenticated|permission|forbidden|not found|agent thread/i.test(raw)) {
    return raw;
  }

  if (/(server error|request id|timeout|timed out|temporar(?:y|ily)|5\d\d)/i.test(raw)) {
    if (language === "ar") {
      return requestId
        ? `تعذر بدء تشغيل المساعد في Workspace الآن. أعد المحاولة بعد قليل. Request ID: ${requestId}`
        : "تعذر بدء تشغيل المساعد في Workspace الآن. أعد المحاولة بعد قليل.";
    }
    return requestId
      ? `Workspace could not start this AI run right now. Please retry in a moment. Request ID: ${requestId}`
      : "Workspace could not start this AI run right now. Please retry in a moment.";
  }

  return raw;
}

function providerFailureMessage(error: unknown, language: AgentResponseLanguage = "en") {
  const raw = error instanceof Error ? error.message : String(error ?? "Agent request failed.");
  if (/401|403|api key|unauthorized|forbidden/i.test(raw)) {
    if (language === "ar") {
      return "تعذر الاتصال بمزود الذكاء الاصطناعي بسبب إعدادات التفويض. تحقق من مفتاح OpenRouter وصلاحية الوصول للنموذج في Workspace.";
    }
    return "AI provider authorization failed. Check the Workspace OpenRouter API key and model access.";
  }
  if (/(model.*(?:not found|invalid|unsupported|retired|shut\s*down|unavailable)|no endpoints?)/i.test(raw)) {
    if (language === "ar") {
      return "نموذج الذكاء الاصطناعي المعد في Workspace غير متاح أو لم يعد مدعومًا. جربت النماذج الاحتياطية أيضًا، لكن لم يكتمل أي منها.";
    }
    return "The configured AI model is unavailable or no longer supported. I tried the configured fallback models too, but none completed.";
  }
  if (language === "ar") {
    return "مزود الذكاء الاصطناعي غير متاح مؤقتًا. جربت النماذج الاحتياطية، لكن لم يكتمل أي منها. أعد المحاولة بعد قليل.";
  }
  return "The AI provider is temporarily unavailable. I tried the configured fallback models, but none completed. Please retry in a moment.";
}

function retryStatusMessage(language: AgentResponseLanguage, attemptIndex: number) {
  if (language === "ar") {
    return attemptIndex === 0
      ? "النموذج الأساسي غير متاح الآن. أجرب نموذجًا احتياطيًا."
      : "النموذج الاحتياطي غير متاح الآن. أجرب نموذجًا آخر.";
  }

  return attemptIndex === 0
    ? "Primary AI model is unavailable. Retrying with a fallback model."
    : "Fallback AI model is unavailable. Trying another model.";
}

export {
  sleep,
  extractRequestId,
  isRetryableModelError,
  startupFailureMessage,
  providerFailureMessage,
  retryStatusMessage,
};
