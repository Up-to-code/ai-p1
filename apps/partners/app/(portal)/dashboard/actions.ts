"use server";

import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth-server";
import { parsePartnerAppFormData } from "@/lib/schemas/partner-app";
import { partnerProfileFormSchema, programmerOrganizationFormSchema } from "@/validation/account";
import { partnerAccountRepository } from "@/server/partnerAccount";
import { partnerAppsRepository } from "@/server/partnerApps";
import { sandboxRepository } from "@/server/sandbox";

export type PartnerAppActionState = {
  ok: boolean;
  message?: string;
  clientId?: string;
  clientSecret?: string;
};

export type AccountActionState = {
  ok: boolean;
  message?: string;
};

export type SandboxActionState = {
  ok: boolean;
  message?: string;
};

function requiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

async function requirePartnerToken() {
  const token = await getToken().catch(() => null);
  if (!token) throw new Error("Authentication required");
  return token;
}

function revalidatePortal() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apps");
  revalidatePath("/dashboard/status");
  revalidatePath("/dashboard/account");
}

export async function updatePartnerProfileAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  try {
    const token = await requirePartnerToken();
    const input = partnerProfileFormSchema.parse({ name: formData.get("name") });
    await partnerAccountRepository.updateProfile(token, input);
    revalidatePortal();
    return { ok: true, message: "Profile updated." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update profile." };
  }
}

export async function updateProgrammerOrganizationAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  try {
    const token = await requirePartnerToken();
    const input = programmerOrganizationFormSchema.parse({
      name: formData.get("name"),
      countryCode: formData.get("countryCode"),
    });
    await partnerAccountRepository.updateOrganization(token, input);
    revalidatePortal();
    return { ok: true, message: "Programmer organization updated." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update organization." };
  }
}

export async function createPartnerAppAction(
  _previousState: PartnerAppActionState,
  formData: FormData,
): Promise<PartnerAppActionState> {
  try {
    const token = await requirePartnerToken();
    const input = parsePartnerAppFormData(formData);
    const result = await partnerAppsRepository.create(token, {
      name: input.name,
      publisherName: input.publisherName,
      homepageUrl: input.homepageUrl,
      iconUrl: input.iconUrl || undefined,
      logoUrl: input.logoUrl || undefined,
      clientType: input.clientType,
      redirectUris: input.redirectUris,
      allowedScopes: input.allowedScopes,
    });
    revalidatePortal();
    return {
      ok: true,
      message: result.clientSecret
        ? "App created. Store this client secret now; it will not be shown again."
        : "App created.",
      clientId: result.clientId,
      clientSecret: result.clientSecret,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not create app." };
  }
}

export async function updatePartnerAppAction(formData: FormData): Promise<PartnerAppActionState> {
  try {
    const token = await requirePartnerToken();
    const input = parsePartnerAppFormData(formData);
    if (!input.appId) throw new Error("appId is required");
    await partnerAppsRepository.update(token, {
      appId: input.appId,
      name: input.name,
      publisherName: input.publisherName,
      homepageUrl: input.homepageUrl,
      iconUrl: input.iconUrl || undefined,
      logoUrl: input.logoUrl || undefined,
      redirectUris: input.redirectUris,
      allowedScopes: input.allowedScopes,
    });
    revalidatePortal();
    revalidatePath(`/dashboard/apps/${input.appId}`);
    revalidatePath(`/dashboard/apps/${input.appId}/settings`);
    return { ok: true, message: "App settings saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update app." };
  }
}

export async function submitPartnerAppForReviewAction(formData: FormData) {
  const token = await requirePartnerToken();
  const appId = requiredString(formData, "appId");
  await partnerAppsRepository.submitForReview(token, appId);
  revalidatePortal();
  revalidatePath(`/dashboard/apps/${appId}`);
}

function readableSandboxError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  return message || fallback;
}

export async function ensureSandboxAction(
  _previousState: SandboxActionState,
  formData: FormData,
): Promise<SandboxActionState> {
  try {
    const token = await requirePartnerToken();
    const appId = requiredString(formData, "appId");
    await sandboxRepository.ensure(token, appId);
    revalidatePath(`/dashboard/apps/${appId}`);
    return { ok: true, message: "Sandbox created." };
  } catch (error) {
    return { ok: false, message: readableSandboxError(error, "Could not create sandbox.") };
  }
}
