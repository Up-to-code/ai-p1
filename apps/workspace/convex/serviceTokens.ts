type ServiceTokenOptions = {
  envName: string;
  errorMessage: string;
  minLength?: number;
};

export function configuredServiceToken(envName: string) {
  return process.env[envName] ?? "";
}

export function timingSafeEqualStrings(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return diff === 0;
}

export function assertWorkspaceServiceToken(token: string, options: ServiceTokenOptions) {
  const configured = configuredServiceToken(options.envName);
  const minLength = options.minLength ?? 1;
  if (configured.length < minLength || !timingSafeEqualStrings(token, configured)) {
    throw new Error(options.errorMessage);
  }
}

export function assertConvexBridgeToken(token: string, errorMessage = "Invalid server function token.") {
  assertWorkspaceServiceToken(token, {
    envName: "WORKSPACE_CONVEX_BRIDGE_SECRET",
    errorMessage,
    minLength: 32,
  });
}

export function assertAdminConvexServiceToken(token: string, minLength = 1) {
  assertWorkspaceServiceToken(token, {
    envName: "ADMIN_CONVEX_SERVICE_TOKEN",
    errorMessage: "Invalid admin service token.",
    minLength,
  });
}
