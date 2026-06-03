import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const exposedWorkOSKey = "sk_test_a2V5XzAxS0VFRFpTUlMxOVBTWjRWWUZCS0JTWks2LGZhazNqeWJaYlU1MjNFZ2Q3QVhQY2JSQmY";

describe("WorkOS secret hygiene", () => {
  it("does not keep the exposed WorkOS test key in local workspace env", () => {
    const envLocal = readFileSync(join(process.cwd(), ".env.local"), "utf8");

    expect(envLocal).not.toContain(exposedWorkOSKey);
  });
});
