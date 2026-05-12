import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import {
  adminReviewPartnerAppSchema,
  partnerAppRegistrationSchema,
} from "../validation/admin-partner-app.schema";
import {
  assertAdminServiceToken,
  listAdminPartnerApps,
  listApprovedPartnerApps,
  reviewAdminPartnerApp,
  upsertPartnerAppRegistration,
} from "../services/admin-partner-apps";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Partner app admin action failed.");
}

export async function handleRegisterPartnerAppFromPartners(c: Context) {
  try {
    assertAdminServiceToken(c.req.raw.headers);
  } catch (error) {
    return handleError(c, error);
  }

  const parsed = await validateJsonBody(c, partnerAppRegistrationSchema, "Invalid partner app registration payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ app: await upsertPartnerAppRegistration(parsed.data) }, 201);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleListAdminPartnerApps(c: Context) {
  try {
    assertAdminServiceToken(c.req.raw.headers);
    return c.json({ apps: await listAdminPartnerApps() });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleReviewAdminPartnerApp(c: Context) {
  try {
    assertAdminServiceToken(c.req.raw.headers);
  } catch (error) {
    return handleError(c, error);
  }

  const appId = c.req.param("appId");
  if (!appId) return c.json({ error: "Partner app id is required." }, 400);
  const parsed = await validateJsonBody(c, adminReviewPartnerAppSchema, "Invalid partner app review payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json(await reviewAdminPartnerApp(appId, parsed.data));
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleListApprovedPartnerAppsCatalog(c: Context) {
  try {
    return c.json({ apps: await listApprovedPartnerApps() });
  } catch (error) {
    return handleError(c, error);
  }
}
