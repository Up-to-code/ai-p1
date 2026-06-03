import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const appRoot = path.resolve(__dirname, "../../app");
const srcRoot = path.resolve(__dirname, "..");
const skippedDirs = new Set(["tests"]);
const checkedExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);

function listSourceFiles(root: string): string[] {
  const rows: string[] = [];
  for (const entry of readdirSync(root)) {
    const fullPath = path.join(root, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (!skippedDirs.has(entry)) rows.push(...listSourceFiles(fullPath));
      continue;
    }
    if (checkedExtensions.has(path.extname(entry))) {
      rows.push(fullPath);
    }
  }
  return rows;
}

test("mobile source stays behind the Workspace API boundary", () => {
  const dbVendor = "con" + "vex";
  const banned = [dbVendor, dbVendor[0].toUpperCase() + dbVendor.slice(1), "@" + dbVendor];
  const matches = [...listSourceFiles(appRoot), ...listSourceFiles(srcRoot)]
    .flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return banned.some((term) => source.includes(term))
        ? [path.relative(path.resolve(__dirname, "../../.."), filePath)]
        : [];
    });

  assert.deepEqual(matches, []);
});

test("mobile source uses WorkOS auth instead of Better Auth", () => {
  const banned = ["better-auth", "@better-auth", "Better Auth"];
  const matches = [...listSourceFiles(appRoot), ...listSourceFiles(srcRoot)]
    .flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return banned.some((term) => source.includes(term))
        ? [path.relative(path.resolve(__dirname, "../../.."), filePath)]
        : [];
    });

  assert.deepEqual(matches, []);
});

test("workspace chooser does not expose manual invite entry UI", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/choose-workspace.tsx"), "utf8");

  assert.equal(source.includes("workspace.join"), false);
  assert.equal(source.includes("invite_input"), false);
  assert.equal(source.includes("parseInviteInput"), false);
});

test("auth landing uses full provider labels", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/index.tsx"), "utf8");

  assert.equal(source.includes("t.auth.continueWithApple"), true);
  assert.equal(source.includes(": t.auth.continueWithGoogle"), true);
  assert.equal(source.includes("label={t.auth.continueWithEmail}"), true);
  assert.equal(source.includes("label=\"Email\""), false);
  assert.equal(source.includes(": \"Google\""), false);
});

test("login progressively reveals password controls after a valid email", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/login.tsx"), "utf8");

  assert.equal(source.includes("const canShowPassword ="), true);
  assert.equal(source.includes("canShowPassword ? ("), true);
  assert.equal(source.includes("testID=\"auth.password_visibility_toggle\""), true);
  assert.equal(source.includes("secureTextEntry={!passwordVisible}"), true);
});

test("forgot password uses a minimal staged reset stack", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/login.tsx"), "utf8");

  assert.equal(source.includes("resetHint"), false);
  assert.equal(source.includes("maskedEmail(resetEmail)"), true);
  assert.equal(source.includes("const shouldShowResetPasswords ="), true);
  assert.equal(source.includes("shouldShowResetPasswords ? ("), true);
  assert.equal(source.includes("resendResetCodeIn"), true);
});

test("register exposes password visibility toggle", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/register.tsx"), "utf8");

  assert.equal(source.includes("testID=\"auth.register_password_visibility_toggle\""), true);
  assert.equal(source.includes("secureTextEntry={!passwordVisible}"), true);
});

test("register supports staged email verification without re-showing password", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/register.tsx"), "utf8");

  assert.equal(source.includes("emailVerificationCode"), true);
  assert.equal(source.includes("confirmWorkspaceEmailVerification"), true);
  assert.equal(source.includes("maskedEmail(emailVerification.email)"), true);
  assert.equal(source.includes("isEmailVerificationMode && emailVerification ?"), true);
});

test("auth callback routes oauth email verification challenges to the code screen", () => {
  const source = readFileSync(path.resolve(appRoot, "auth-callback.tsx"), "utf8");

  assert.equal(source.includes("emailVerification === \"1\""), true);
  assert.equal(source.includes("const code = firstSearchParam(params.code)"), true);
  assert.equal(source.includes("if (code) query.set(\"code\", code);"), true);
  assert.equal(source.includes("if (callbackState) query.set(\"state\", callbackState);"), true);
  assert.equal(source.includes("await authClient.completeMobileCallback"), true);
  assert.equal(source.includes("markAuthSessionActive();"), true);
  assert.equal(source.includes("router.replace(\"/\");"), true);
  assert.equal(source.includes("pendingAuthenticationToken"), true);
  assert.equal(source.includes("pathname: \"/(auth)/login\""), true);
});

test("mobile password auth does not expose hosted fallback urls", () => {
  const authClientSource = readFileSync(path.resolve(srcRoot, "auth/authClient.ts"), "utf8");
  const socialAuthSource = readFileSync(path.resolve(srcRoot, "auth/socialAuth.ts"), "utf8");
  const loginSource = readFileSync(path.resolve(appRoot, "(auth)/login.tsx"), "utf8");
  const registerSource = readFileSync(path.resolve(appRoot, "(auth)/register.tsx"), "utf8");

  assert.equal(authClientSource.includes("fallbackUrl"), false);
  assert.equal(socialAuthSource.includes("fallbackUrl"), false);
  assert.equal(loginSource.includes("fallbackUrl"), false);
  assert.equal(registerSource.includes("fallbackUrl"), false);
});

test("mobile WorkOS sealed sessions are chunked before SecureStore persistence", () => {
  const source = readFileSync(path.resolve(srcRoot, "auth/authClient.ts"), "utf8");

  assert.equal(source.includes("secureStoreChunkSize"), true);
  assert.equal(source.includes("sealedSessionChunkCountKey"), true);
  assert.equal(source.includes("secureSetSealedSession"), true);
  assert.equal(source.includes("readSealedSession"), true);
  assert.equal(source.includes("await clearSealedSession();"), true);
});

test("mobile social auth opens the WorkOS url returned by the start endpoint", () => {
  const source = readFileSync(path.resolve(srcRoot, "auth/authClient.ts"), "utf8");
  const callbackSource = readFileSync(path.resolve(srcRoot, "auth/mobileAuthCallback.ts"), "utf8");

  assert.equal(source.includes("/api/auth/workos/mobile/start"), true);
  assert.equal(source.includes("/api/auth/workos/mobile/complete"), true);
  assert.equal(source.includes("const authUrl = await startSocialAuth"), true);
  assert.equal(source.includes("activeOAuthTransaction"), true);
  assert.equal(source.includes("oauthTransactionKey"), true);
  assert.equal(source.includes("await storeOAuthTransaction"), true);
  assert.equal(source.includes("await clearOAuthTransaction"), true);
  assert.equal(source.includes("async function clearCredential()"), true);
  assert.equal(source.includes("if (result.type === \"success\" && result.url)"), true);
  assert.equal(source.includes("if (result.type === \"cancel\")"), true);
  assert.equal(source.includes("WebBrowser.openAuthSessionAsync(\n        authUrl,"), true);
  assert.equal(source.includes("/api/auth/workos/mobile/login"), false);
  assert.equal(source.includes("/api/auth/workos/mobile/callback"), false);
  assert.equal(callbackSource.includes("Linking.createURL(mobileAuthCallbackPath"), true);
  assert.equal(callbackSource.includes("scheme: mobileAuthScheme"), true);
  assert.equal(callbackSource.includes("isTripleSlashed: true"), false);
  assert.equal(callbackSource.includes("mobileAuthCallbackUrlWithQuery"), true);
});
