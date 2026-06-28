import { ConvexHttpClient } from "convex/browser";
import { convexRuntimeConfig } from "@/packages/config";

type ConvexHttpCalls = {
  query: <TArgs, TResult>(ref: unknown, args: TArgs) => Promise<TResult>;
  mutation: <TArgs, TResult>(ref: unknown, args: TArgs) => Promise<TResult>;
  action: <TArgs, TResult>(ref: unknown, args: TArgs) => Promise<TResult>;
};

function createConvexHttpCalls(client: {
  query: (ref: any, args: any) => Promise<unknown>;
  mutation: (ref: any, args: any) => Promise<unknown>;
  action: (ref: any, args: any) => Promise<unknown>;
}): ConvexHttpCalls {
  return {
    query: <TArgs, TResult>(ref: unknown, args: TArgs) =>
      client.query(ref as never, args as never) as Promise<TResult>,
    mutation: <TArgs, TResult>(ref: unknown, args: TArgs) =>
      client.mutation(ref as never, args as never) as Promise<TResult>,
    action: <TArgs, TResult>(ref: unknown, args: TArgs) =>
      client.action(ref as never, args as never) as Promise<TResult>,
  };
}

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
