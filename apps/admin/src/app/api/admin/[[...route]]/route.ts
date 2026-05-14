import { createAdminHonoApp } from "@/lib/admin-hono";

export const dynamic = "force-dynamic";

const app = createAdminHonoApp();

export const GET = app.fetch;
export const POST = app.fetch;
