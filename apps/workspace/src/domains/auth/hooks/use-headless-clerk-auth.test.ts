import { describe, expect, it, vi, beforeAll } from "vitest";

// Simple state tracking for mocked useState
const stateStore = new Map<number, [unknown, (v: unknown) => void]>();
let stateKey = 0;

vi.mock("react", () => ({
  useState: (initial: unknown) => {
    const key = stateKey++;
    if (!stateStore.has(key)) {
      stateStore.set(key, [
        initial,
        (val: unknown) => {
          const setter = stateStore.get(key);
          if (setter) {
            const newVal = typeof val === "function" ? val(setter[0]) : val;
            setter[0] = newVal;
          }
        },
      ]);
    }
    return stateStore.get(key)!;
  },
  useEffect: vi.fn((fn: () => void | (() => void)) => fn()),
  useMemo: vi.fn((fn: () => unknown) => fn()),
  default: {},
}));

const mockSignInCreate = vi.fn();
const mockSignUpCreate = vi.fn();
const mockSignInAuthenticateWithRedirect = vi.fn();
const mockSignUpAuthenticateWithRedirect = vi.fn();
const mockRouterPush = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useSignIn: vi.fn(() => ({
    signIn: {
      create: mockSignInCreate,
      authenticateWithRedirect: mockSignInAuthenticateWithRedirect,
      status: "complete",
    },
  })),
  useSignUp: vi.fn(() => ({
    signUp: {
      create: mockSignUpCreate,
      authenticateWithRedirect: mockSignUpAuthenticateWithRedirect,
      status: "complete",
    },
  })),
}));

vi.mock("@/i18n/routing", () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
}));

beforeAll(() => {
  vi.stubGlobal("window", {
    location: {
      origin: "http://localhost:3000",
      href: "http://localhost:3000/en/sign-in",
    },
  });
});

describe("useHeadlessClerkAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateStore.clear();
    stateKey = 0;
  });

  it("must use absolute redirectUrl for social sign-in (sign-in mode)", async () => {
    const { useHeadlessClerkAuth } = await import("./use-headless-clerk-auth");
    const auth = useHeadlessClerkAuth({
      callbackURL: null,
      locale: "en",
      mode: "sign-in",
    });

    await auth.signInWithSocial("google");

    expect(mockSignInAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: "oauth_google",
      redirectUrl: "http://localhost:3000/en/sso-callback",
      redirectUrlComplete: "http://localhost:3000/en/ws",
    });
  });

  it("must use absolute redirectUrl for social sign-in (sign-up mode)", async () => {
    const { useHeadlessClerkAuth } = await import("./use-headless-clerk-auth");
    const auth = useHeadlessClerkAuth({
      callbackURL: null,
      locale: "ar",
      mode: "sign-up",
    });

    await auth.signInWithSocial("google");

    expect(mockSignUpAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: "oauth_google",
      redirectUrl: "http://localhost:3000/ar/sso-callback",
      redirectUrlComplete: "http://localhost:3000/ar/ws",
    });
  });

  it("must use callbackURL as redirectUrlComplete when provided", async () => {
    const { useHeadlessClerkAuth } = await import("./use-headless-clerk-auth");
    const auth = useHeadlessClerkAuth({
      callbackURL: "/en/choose-org",
      locale: "en",
      mode: "sign-in",
    });

    await auth.signInWithSocial("google");

    expect(mockSignInAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: "oauth_google",
      redirectUrl: "http://localhost:3000/en/sso-callback",
      redirectUrlComplete: "http://localhost:3000/en/choose-org",
    });
  });

  it("should return isLoaded as true when signIn and signUp are available", async () => {
    const { useHeadlessClerkAuth } = await import("./use-headless-clerk-auth");
    const auth = useHeadlessClerkAuth({
      callbackURL: null,
      locale: "en",
      mode: "sign-in",
    });

    expect(auth.isLoaded).toBe(true);
  });

  it("should call authenticateWithRedirect on social sign-in", async () => {
    const { useHeadlessClerkAuth } = await import("./use-headless-clerk-auth");
    const auth = useHeadlessClerkAuth({
      callbackURL: null,
      locale: "en",
      mode: "sign-in",
    });

    await auth.signInWithSocial("google");

    expect(mockSignInAuthenticateWithRedirect).toHaveBeenCalledOnce();
    expect(mockSignInAuthenticateWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: "oauth_google" }),
    );
  });
});
