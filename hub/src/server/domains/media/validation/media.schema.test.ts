import { describe, expect, it } from "vitest";
import { inferMediaKind, validateMediaKind } from "./media.schema";

describe("media validation", () => {
  it("infers media kind from MIME type", () => {
    expect(inferMediaKind("image/webp")).toBe("image");
    expect(inferMediaKind("video/mp4")).toBe("video");
    expect(inferMediaKind("application/pdf")).toBe("document");
  });

  it("rejects a mismatched submitted kind", () => {
    expect(() => validateMediaKind("image/png", "document")).toThrow(/does not match/);
  });
});
