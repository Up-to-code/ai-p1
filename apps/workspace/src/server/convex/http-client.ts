import { ConvexHttpClient } from "convex/browser";
import { createConvexHttpCalls } from "@qentrah/convex-adapters";
import { convexRuntimeConfig } from "@/packages/config";

export const convexHttp = new ConvexHttpClient(convexRuntimeConfig.url);
export const convexCalls = createConvexHttpCalls(convexHttp);
