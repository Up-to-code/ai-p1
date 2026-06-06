import { workspaceApiFetch } from "./workspaceApiClient";

export type PushDeviceStatus = {
  hasActiveDevice: boolean;
  devices: Array<{
    _id: string;
    installationId: string;
    platform: string;
    appVersion?: string;
    tokenLast4?: string;
    status: "active" | "revoked";
    lastRegisteredAt: number;
  }>;
};

async function jsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload
      ? String((payload as { error: unknown }).error)
      : fallbackMessage;
    throw new Error(message);
  }
  return payload as T;
}

export async function getPushDeviceStatus() {
  const response = await workspaceApiFetch("/api/v1/profile/push-devices");
  return jsonOrThrow<PushDeviceStatus>(response, "Unable to load notification status.");
}

export async function registerPushDevice(input: {
  pushToken: string;
  installationId: string;
  platform: string;
  appVersion?: string;
}) {
  const response = await workspaceApiFetch("/api/v1/profile/push-devices", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return jsonOrThrow<{ device: PushDeviceStatus["devices"][number] }>(response, "Unable to register push device.");
}

export async function removePushDevice(installationId: string) {
  const response = await workspaceApiFetch(`/api/v1/profile/push-devices/${encodeURIComponent(installationId)}`, {
    method: "DELETE",
  });
  return jsonOrThrow<{ removed: boolean }>(response, "Unable to remove push device.");
}
