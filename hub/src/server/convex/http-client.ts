import { ConvexHttpClient } from "convex/browser";
import { convexRuntimeConfig } from "@/packages/config";

export const convexHttp = new ConvexHttpClient(convexRuntimeConfig.url);
