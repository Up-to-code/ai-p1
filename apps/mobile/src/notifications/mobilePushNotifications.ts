import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

import { registerPushDevice, removePushDevice } from "@/persistence/api/notificationsApi";
import { getStoredInstallationId, isNativeWorkspaceRuntime } from "@/persistence/api/workspaceApiClient";
import { useAppStore } from "@/store";

type ExpoRouter = ReturnType<typeof useRouter>;
type ExpoNotificationsModule = typeof import("expo-notifications");
type NotificationResponse = Awaited<ReturnType<ExpoNotificationsModule["getLastNotificationResponseAsync"]>>;

let notificationsHandlerConfigured = false;

function getNotificationsModule(): ExpoNotificationsModule | null {
  try {
    return require("expo-notifications") as ExpoNotificationsModule;
  } catch {
    return null;
  }
}

function getConfiguredNotificationsModule(): ExpoNotificationsModule | null {
  const notifications = getNotificationsModule();
  if (!notifications) return null;

  if (!notificationsHandlerConfigured) {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationsHandlerConfigured = true;
  }

  return notifications;
}

export type PushRegistrationResult =
  | { status: "registered"; installationId: string; tokenLast4?: string }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "missingProjectId" };

function getExpoProjectId() {
  const constants = Constants as typeof Constants & {
    easConfig?: { projectId?: string };
  };
  return constants.expoConfig?.extra?.eas?.projectId
    ?? constants.easConfig?.projectId
    ?? null;
}

function getAppVersion() {
  return Constants.expoConfig?.version ?? "unknown";
}

async function ensureAndroidChannel() {
  const notifications = getConfiguredNotificationsModule();
  if (!notifications) return false;
  if (Platform.OS !== "android") return;
  await notifications.setNotificationChannelAsync("qentrah-reminders", {
    name: "Qentrah reminders",
    importance: notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#0b5cff",
  });
  return true;
}

export async function registerCurrentDeviceForPush(): Promise<PushRegistrationResult> {
  if (!isNativeWorkspaceRuntime()) return { status: "unsupported" };
  const notifications = getConfiguredNotificationsModule();
  if (!notifications) return { status: "unsupported" };

  await ensureAndroidChannel();
  const currentPermission = await notifications.getPermissionsAsync();
  const permission = currentPermission.granted
    ? currentPermission
    : await notifications.requestPermissionsAsync();
  if (!permission.granted) return { status: "denied" };

  const projectId = getExpoProjectId();
  if (!projectId) return { status: "missingProjectId" };

  const token = await notifications.getExpoPushTokenAsync({ projectId });
  const installationId = await getStoredInstallationId();
  const result = await registerPushDevice({
    pushToken: token.data,
    installationId,
    platform: Platform.OS,
    appVersion: getAppVersion(),
  });

  return {
    status: "registered",
    installationId,
    tokenLast4: result.device.tokenLast4,
  };
}

export async function unregisterCurrentDeviceForPush() {
  const installationId = await getStoredInstallationId();
  await removePushDevice(installationId);
  return installationId;
}

export function resolvePushNotificationRoute(data: Record<string, unknown>) {
  const threadId = typeof data.threadId === "string" ? data.threadId : null;
  if (threadId) return { route: "/(app)" as const, threadId };

  const url = typeof data.url === "string" ? data.url : "";
  const threadMatch = /[?&]threadId=([^&]+)/u.exec(url);
  if (threadMatch?.[1]) {
    return { route: "/(app)" as const, threadId: decodeURIComponent(threadMatch[1]) };
  }

  return { route: "/(app)" as const, threadId: null };
}

function handleNotificationResponse(router: ExpoRouter, response: NonNullable<NotificationResponse>) {
  const data = response.notification.request.content.data ?? {};
  const target = resolvePushNotificationRoute(data as Record<string, unknown>);
  if (target.threadId) {
    useAppStore.getState().setActiveThreadId(target.threadId);
  }
  router.push(target.route as never);
}

export function useMobilePushNotificationRouting() {
  const router = useRouter();

  useEffect(() => {
    const notifications = getConfiguredNotificationsModule();
    if (!notifications) return undefined;

    let mounted = true;
    notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (mounted && response) handleNotificationResponse(router, response);
      })
      .catch(() => undefined);

    const subscription = notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(router, response);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [router]);
}
