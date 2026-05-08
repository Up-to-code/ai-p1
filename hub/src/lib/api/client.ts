import { hc } from "hono/client";
import type { AppType } from "@/server/app";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = apiUrl ? hc<AppType>(apiUrl) : null;
