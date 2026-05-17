import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

describe("demo middleware", () => {
  it("lets visitors open the demo landing and dashboard without the old setup gate", async () => {
    const response = await proxy(new NextRequest("http://localhost:3004/dashboard"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
