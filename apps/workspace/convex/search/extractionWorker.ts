import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { MAX_EXTRACTED_TEXT_CHARS, MAX_EXTRACTION_SOURCE_BYTES } from "./extraction";

const MAX_SECURITY_BATCH = 5;
const MAX_EXTRACTION_BATCH = 5;
const MAX_SECURITY_SOURCE_BYTES = 25 * 1_024 * 1_024;
const REQUEST_TIMEOUT_MS = 25_000;

type Source = { url: string; name: string; mimeType: string; size: number; updatedAt: number; malwareScanStatus?: string; locale?: string };

export const processSecurityBatch = internalAction({
  args: {},
  returns: v.object({ configured: v.boolean(), processed: v.number(), failed: v.number() }),
  handler: async (ctx) => {
    const endpoint = process.env.MALWARE_SCANNER_URL?.trim();
    if (!endpoint) return { configured: false, processed: 0, failed: 0 };
    let processed = 0;
    let failed = 0;
    for (let index = 0; index < MAX_SECURITY_BATCH; index += 1) {
      const job = await ctx.runMutation(internal.search.extraction.claimSecurityJob, { now: Date.now() });
      if (!job) break;
      try {
        const source = await ctx.runQuery(internal.search.extraction.loadSecuritySource, { organizationId: job.organizationId, mediaId: job.mediaId });
        if (!source) throw new Error("Media source no longer exists.");
        const bytes = await fetchSourceBytes(source, MAX_SECURITY_SOURCE_BYTES);
        const verdict = await scanForMalware(endpoint, bytes, source);
        await ctx.runMutation(internal.search.extraction.completeSecurityJob, {
          jobId: job._id,
          verdict: verdict.verdict,
          engine: verdict.engine,
          engineVersion: verdict.engineVersion,
          signature: verdict.signature,
          now: Date.now(),
        });
        processed += 1;
      } catch (error) {
        await ctx.runMutation(internal.search.extraction.failSecurityJob, { jobId: job._id, now: Date.now(), error: errorMessage(error) });
        failed += 1;
      }
    }
    return { configured: true, processed, failed };
  },
});

export const processExtractionBatch = internalAction({
  args: {},
  returns: v.object({ configured: v.boolean(), processed: v.number(), failed: v.number() }),
  handler: async (ctx) => {
    const tikaUrl = process.env.TIKA_URL?.trim();
    const tesseractUrl = process.env.TESSERACT_OCR_URL?.trim();
    if (!tikaUrl && !tesseractUrl) return { configured: false, processed: 0, failed: 0 };
    let processed = 0;
    let failed = 0;
    for (let index = 0; index < MAX_EXTRACTION_BATCH; index += 1) {
      const job = await ctx.runMutation(internal.search.extraction.claimExtractionJob, { now: Date.now() });
      if (!job) break;
      try {
        const source = await ctx.runQuery(internal.search.extraction.loadExtractionSource, { organizationId: job.organizationId, mediaId: job.mediaId });
        if (!source || source.updatedAt !== job.sourceUpdatedAt) throw new Error("Clean media source is unavailable or changed.");
        const bytes = await fetchSourceBytes(source, MAX_EXTRACTION_SOURCE_BYTES);
        const result = job.extractor === "tesseract"
          ? await extractWithTesseract(requiredEndpoint(tesseractUrl, "Tesseract OCR"), bytes, source, job.ocrLanguages)
          : await extractWithTika(requiredEndpoint(tikaUrl, "Apache Tika"), bytes, source);
        await ctx.runMutation(internal.search.extraction.completeExtractionJob, {
          jobId: job._id,
          text: result.text.slice(0, MAX_EXTRACTED_TEXT_CHARS),
          locale: source.locale ?? job.ocrLanguages[0] ?? "en",
          metadata: result.metadata,
          extractorVersion: result.version,
          ocrLanguages: job.extractor === "tesseract" ? job.ocrLanguages : [],
          now: Date.now(),
        });
        processed += 1;
      } catch (error) {
        await ctx.runMutation(internal.search.extraction.failExtractionJob, { jobId: job._id, now: Date.now(), error: errorMessage(error) });
        failed += 1;
      }
    }
    return { configured: true, processed, failed };
  },
});

export async function fetchSourceBytes(source: Pick<Source, "url" | "size">, maxBytes: number) {
  assertAllowedSourceUrl(source.url);
  if (source.size <= 0 || source.size > maxBytes) throw new Error(`Media exceeds the ${maxBytes}-byte processing limit.`);
  const response = await fetch(source.url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), redirect: "error" });
  if (!response.ok) throw new Error(`Media source request failed (${response.status}).`);
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new Error("Media source declared a size above the processing limit.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > maxBytes) throw new Error("Media source exceeded the processing limit.");
  return bytes;
}

export function assertAllowedSourceUrl(value: string) {
  const url = new URL(value);
  const configuredHosts = (process.env.MEDIA_EXTRACTION_SOURCE_HOSTS ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  const builtIn = url.hostname.endsWith(".ufs.sh") || url.hostname === "ufs.sh" || url.hostname.endsWith(".uploadthing.com");
  if (url.protocol !== "https:" || (!builtIn && !configuredHosts.includes(url.hostname.toLowerCase()))) {
    throw new Error("Media source host is not approved for extraction.");
  }
}

async function scanForMalware(
  endpoint: string,
  bytes: ArrayBuffer,
  source: Pick<Source, "name" | "mimeType">,
): Promise<{ verdict: "clean" | "infected"; engine: string; engineVersion: string; signature?: string }> {
  const response = await fetch(endpoint, {
    method: "POST",
    body: bytes,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: scannerHeaders(source),
  });
  if (!response.ok) throw new Error(`Malware scanner failed (${response.status}).`);
  const result = await response.json();
  if (!isRecord(result)) throw new Error("Malware scanner returned an invalid response.");
  const verdict = result.verdict;
  if (verdict !== "clean" && verdict !== "infected") throw new Error("Malware scanner returned an invalid verdict.");
  return {
    verdict,
    engine: textValue(result.engine) || "configured-scanner",
    engineVersion: textValue(result.version) || "unknown",
    signature: textValue(result.signature)?.slice(0, 500),
  };
}

async function extractWithTika(endpoint: string, bytes: ArrayBuffer, source: Pick<Source, "name" | "mimeType">) {
  const response = await fetch(`${endpoint.replace(/\/$/u, "")}/tika`, {
    method: "PUT",
    body: bytes,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { "Content-Type": source.mimeType, Accept: "text/plain", "Content-Disposition": contentDisposition(source.name), "X-Tika-PDFmaxMainMemoryBytes": String(MAX_EXTRACTION_SOURCE_BYTES) },
  });
  if (!response.ok) throw new Error(`Apache Tika failed (${response.status}).`);
  return {
    text: await response.text(),
    version: response.headers.get("x-tika-version") ?? "unknown",
    metadata: responseMetadata(response, source),
  };
}

async function extractWithTesseract(endpoint: string, bytes: ArrayBuffer, source: Pick<Source, "name" | "mimeType">, languages: string[]) {
  const url = new URL(endpoint);
  if (languages.length) url.searchParams.set("languages", languages.join("+"));
  const response = await fetch(url, { method: "POST", body: bytes, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: scannerHeaders(source) });
  if (!response.ok) throw new Error(`Tesseract OCR failed (${response.status}).`);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const result = await response.json();
    if (!isRecord(result)) throw new Error("Tesseract OCR returned an invalid response.");
    const metadata = isRecord(result.metadata)
      ? Object.entries(result.metadata).flatMap(([key, value]) => typeof value === "string" ? [{ key, value }] : []).slice(0, 100)
      : [];
    return { text: textValue(result.text) ?? "", version: textValue(result.version) ?? "unknown", metadata };
  }
  return { text: await response.text(), version: response.headers.get("x-tesseract-version") ?? "unknown", metadata: responseMetadata(response, source) };
}

function scannerHeaders(source: Pick<Source, "name" | "mimeType">) {
  return {
    "Content-Type": source.mimeType,
    "Content-Disposition": contentDisposition(source.name),
    ...(process.env.MALWARE_SCANNER_API_KEY ? { Authorization: `Bearer ${process.env.MALWARE_SCANNER_API_KEY}` } : {}),
  };
}

function responseMetadata(response: Response, source: Pick<Source, "name" | "mimeType">) {
  return [
    { key: "filename", value: source.name },
    { key: "mimeType", value: source.mimeType },
    ...(response.headers.get("content-language") ? [{ key: "contentLanguage", value: response.headers.get("content-language") ?? "" }] : []),
  ];
}

function contentDisposition(filename: string) {
  return `attachment; filename="${filename.replace(/["\r\n]/gu, "_").slice(0, 180)}"`;
}

function requiredEndpoint(value: string | undefined, label: string) {
  if (!value) throw new Error(`${label} is not configured.`);
  return value;
}

function errorMessage(error: unknown) {
  return (error instanceof Error ? error.message : "Extraction worker failed.").slice(0, 2_000);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}
