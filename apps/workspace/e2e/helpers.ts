import { expect, type APIRequestContext, type Page } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 8)}`;
}

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function authPost<T>(request: APIRequestContext, path: string, data: unknown) {
  const response = await request.post(path, {
    data,
    headers: { origin: baseURL },
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: { message?: string }; message?: string };
  expect(response.ok(), payload.error?.message ?? payload.message).toBeTruthy();
  return payload;
}

async function signUp(request: APIRequestContext, email: string) {
  await authPost(request, "/api/auth/sign-up/email", {
    email,
    password: "Password12345!",
    name: email.split("@")[0],
  });
  await authPost(request, "/api/auth/sign-in/email", {
    email,
    password: "Password12345!",
  });
}

async function createOrganization(request: APIRequestContext, name = uniqueName("E2E Org")) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const payload = await authPost<{ id?: string; data?: { id?: string } }>(request, "/api/auth/organization/create", {
    name,
    slug,
    metadata: { type: "developer", status: "Workspace ready" },
  });
  const organizationId = payload.id ?? payload.data?.id;
  expect(organizationId).toBeTruthy();
  await authPost(request, "/api/auth/organization/set-active", { organizationId });
  return organizationId as string;
}

export async function prepareOwner(page: Page, prefix = "owner") {
  const email = uniqueEmail(prefix);
  await signUp(page.request, email);
  const organizationId = await createOrganization(page.request);
  const requestState = await page.request.storageState();
  await page.context().addCookies(requestState.cookies);
  return { email, organizationId };
}

async function jsonOrThrow<T>(response: { ok: () => boolean; json: () => Promise<unknown> }) {
  const payload = await response.json().catch(() => ({}));
  expect(response.ok(), JSON.stringify(payload)).toBeTruthy();
  return payload as T;
}

export function projectPayload(name = uniqueName("E2E Project")) {
  return {
    name,
    developer: "Codex Development",
    city: "Downtown",
    area: "Central District",
    type: "Residential",
    assetTypes: ["Apartment"],
    status: "draft",
    visibility: "private",
    assetCount: 12,
    averagePrice: "850K USD",
    priceRange: "850K USD",
    description: "A complete end to end project record for automated browser coverage.",
  };
}

export async function createProject(request: APIRequestContext, organizationId: string, input = projectPayload()) {
  const response = await request.post(`/api/v1/organizations/${organizationId}/projects`, {
    data: input,
    headers: { "content-type": "application/json" },
  });
  return jsonOrThrow<{ project: { id: string } }>(response);
}

export function assetPayload(project: { id: string; name: string }, title = uniqueName("E2E Asset")) {
  return {
    title,
    projectId: project.id,
    project: project.name,
    city: "Downtown",
    type: "Apartment",
    status: "draft",
    visibility: "private",
    purpose: "sale",
    price: "900000",
    area: "120 m2",
    bedrooms: 2,
    bathrooms: 2,
    description: "A complete asset record for automated browser coverage.",
  };
}

export async function createAsset(
  request: APIRequestContext,
  organizationId: string,
  project: { id: string; name: string },
  input = assetPayload(project),
) {
  const response = await request.post(`/api/v1/organizations/${organizationId}/assets`, {
    data: input,
    headers: { "content-type": "application/json" },
  });
  return jsonOrThrow<{ asset: { id: string } }>(response);
}

export async function updateAsset(
  request: APIRequestContext,
  organizationId: string,
  assetId: string,
  project: { id: string; name: string },
  input = assetPayload(project),
) {
  const response = await request.patch(`/api/v1/organizations/${organizationId}/assets/${assetId}`, {
    data: input,
    headers: { "content-type": "application/json" },
  });
  return jsonOrThrow<{ asset: { id: string } }>(response);
}

function clientPayload(name = uniqueName("E2E Client")) {
  return {
    name,
    type: "Buyer",
    contact: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`,
    phone: "+966555000111",
    age: 34,
    nationality: "Global",
    generation: "Millennial",
    budget: "900K - 1.2M USD",
    assetInterest: "2BR apartment in Downtown",
    status: "active",
    visibility: "private",
    pipelineStage: "new",
    priority: "normal",
    nextAction: "Schedule viewing",
  };
}

export async function createClient(request: APIRequestContext, organizationId: string, input = clientPayload()) {
  const response = await request.post(`/api/v1/organizations/${organizationId}/clients`, {
    data: input,
    headers: { "content-type": "application/json" },
  });
  return jsonOrThrow<{ client: { id: string } }>(response);
}

export async function createClientTask(request: APIRequestContext, organizationId: string, clientId: string, title = uniqueName("E2E Task")) {
  const response = await request.post(`/api/v1/organizations/${organizationId}/client-tasks`, {
    data: {
      clientId,
      title,
      status: "open",
      visibility: "private",
      priority: "normal",
    },
    headers: { "content-type": "application/json" },
  });
  return jsonOrThrow<{ task: { id: string } }>(response);
}

export async function createCalendarEvent(
  request: APIRequestContext,
  organizationId: string,
  input: {
    title: string;
    clientId?: string;
    assetId?: string;
    taskId?: string;
    date?: string;
    time?: string;
  },
) {
  const response = await request.post(`/api/v1/organizations/${organizationId}/calendar-events`, {
    data: {
      title: input.title,
      owner: "Team",
      date: input.date ?? "2026-05-15",
      time: input.time ?? "10:00",
      type: "visit",
      status: "confirmed",
      clientId: input.clientId,
      assetId: input.assetId,
      taskId: input.taskId,
      location: "Downtown",
      notes: "Created by E2E coverage.",
    },
    headers: { "content-type": "application/json" },
  });
  return jsonOrThrow<{ event: { id: string } }>(response);
}

export async function expectGoneFromList(page: Page, text: string) {
  await expect(page.getByText(text, { exact: false })).toHaveCount(0);
}
