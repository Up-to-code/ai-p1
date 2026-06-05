import { ConvexHttpClient } from "convex/browser";
import { createConvexHttpCalls } from "@qentrah/convex-adapters";
import { convexRuntimeConfig } from "@/packages/config";

type ConvexHttp = InstanceType<typeof ConvexHttpClient>;

let client: ConvexHttp | null = null;

function getConvexHttp() {
  if (client) return client;

  const url = convexRuntimeConfig.url.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL must be configured before calling Convex.");
  }

  client = new ConvexHttpClient(url);
  return client;
}

export const convexHttp = {
  query: (ref: Parameters<ConvexHttp["query"]>[0], args: Parameters<ConvexHttp["query"]>[1]) =>
    getConvexHttp().query(ref, args),
  mutation: (ref: Parameters<ConvexHttp["mutation"]>[0], args: Parameters<ConvexHttp["mutation"]>[1]) =>
    getConvexHttp().mutation(ref, args),
  action: (ref: Parameters<ConvexHttp["action"]>[0], args: Parameters<ConvexHttp["action"]>[1]) =>
    getConvexHttp().action(ref, args),
};
export const convexCalls = createConvexHttpCalls(convexHttp);
