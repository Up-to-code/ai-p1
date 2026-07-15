import { afterEach, describe, expect, it, vi } from "vitest";
import { assertAllowedSourceUrl, fetchSourceBytes } from "./extractionWorker";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("attachment extraction source boundary", () => {
  it("allows HTTPS UploadThing sources and configured private hosts", () => {
    expect(() => assertAllowedSourceUrl("https://tenant.ufs.sh/f/example")).not.toThrow();
    vi.stubEnv("MEDIA_EXTRACTION_SOURCE_HOSTS", "media.example.test");
    expect(() => assertAllowedSourceUrl("https://media.example.test/object")).not.toThrow();
  });

  it("rejects insecure and unapproved source hosts", () => {
    expect(() => assertAllowedSourceUrl("http://tenant.ufs.sh/f/example")).toThrow(/not approved/u);
    expect(() => assertAllowedSourceUrl("https://example.test/object")).toThrow(/not approved/u);
  });

  it("rejects oversized bodies even when the response omits its size", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array(11))));

    await expect(fetchSourceBytes(
      { url: "https://tenant.ufs.sh/f/example", size: 10 },
      10,
    )).rejects.toThrow(/exceeded/u);
  });

  it("returns a source only when its declared and actual sizes are within the limit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array(4), {
      headers: { "content-length": "4" },
    })));

    const bytes = await fetchSourceBytes(
      { url: "https://tenant.ufs.sh/f/example", size: 4 },
      4,
    );
    expect(bytes.byteLength).toBe(4);
  });
});
