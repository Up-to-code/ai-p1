import { hc } from "hono/client";

type HonoApp = never;

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = apiUrl ? hc<HonoApp>(apiUrl) : null;
