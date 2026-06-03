import { WorkOS } from "@workos-inc/node";
import { workosRuntimeConfig } from "@/packages/config";

let cachedWorkOS: WorkOS | null = null;

export function getWorkOSClient() {
  if (cachedWorkOS) return cachedWorkOS;
  cachedWorkOS = new WorkOS(workosRuntimeConfig.apiKey, {
    clientId: workosRuntimeConfig.clientId || undefined,
  });
  return cachedWorkOS;
}

export function assertWorkOSConfigured() {
  if (!workosRuntimeConfig.enabled) {
    throw new Error("WorkOS auth is not enabled.");
  }
  if (!workosRuntimeConfig.apiKey || !workosRuntimeConfig.clientId) {
    throw new Error("WorkOS API key and client id are required.");
  }
}

