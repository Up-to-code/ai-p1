import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/actions", () => ({
  getCapabilities: vi.fn(),
}));

import { getCapabilities } from "../services/actions";
import { handleGetOrganizationCapabilities } from "./actions";

function createContext(organizationId = "org_1") {
  return {
    req: {
      param: (name: string) => (name === "organizationId" ? organizationId : undefined),
    },
    json: vi.fn((body, status) => ({ body, status })),
  } as never;
}

describe("organization capability handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns capabilities unchanged", async () => {
    const capabilities = { canReadOrganization: true };
    vi.mocked(getCapabilities).mockResolvedValue(capabilities as never);

    const context = createContext();
    await expect(handleGetOrganizationCapabilities(context)).resolves.toEqual({
      body: { capabilities },
      status: undefined,
    });
  });

  it("warns in development when capability loading is slow", async () => {
    vi.mocked(getCapabilities).mockResolvedValue({ canReadOrganization: true } as never);
    vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(800);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await handleGetOrganizationCapabilities(createContext("org_slow"));

    expect(warn).toHaveBeenCalledWith(
      "[organization-capabilities] Slow capability load",
      {
        route: "GET /api/v1/organizations/:organizationId/capabilities",
        organizationId: "org_slow",
        elapsedMs: 800,
      },
    );
  });

  it("does not emit slow warnings in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(getCapabilities).mockResolvedValue({ canReadOrganization: true } as never);
    vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(900);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await handleGetOrganizationCapabilities(createContext("org_prod"));

    expect(warn).not.toHaveBeenCalled();
  });
});
