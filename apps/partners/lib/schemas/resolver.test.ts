import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { zodFormResolver } from "./resolver";

describe("zodFormResolver", () => {
  it("only returns requested field errors during scoped validation", async () => {
    const resolver = zodFormResolver(
      z.object({
        visible: z.string().min(1, "Visible is required."),
        hidden: z.string().min(1, "Hidden is required."),
      }),
    );

    const result = await resolver(
      { visible: "", hidden: "" },
      undefined,
      {
        criteriaMode: "firstError",
        fields: {},
        names: ["visible"],
        shouldUseNativeValidation: false,
      },
    );

    expect(result.errors).toEqual({
      visible: { type: "too_small", message: "Visible is required." },
    });
  });
});
