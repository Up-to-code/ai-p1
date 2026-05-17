import { handle } from "hono/vercel";
import { partnersHonoApp } from "@/server/hono/partners-app";

export const GET = handle(partnersHonoApp);
export const POST = handle(partnersHonoApp);
export const PUT = handle(partnersHonoApp);
export const PATCH = handle(partnersHonoApp);
export const DELETE = handle(partnersHonoApp);
export const OPTIONS = handle(partnersHonoApp);
