import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { CONTENTFUL_CACHE_TAG } from "@/lib/contentful";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function POST(request: Request) {
  const secret = process.env.CONTENTFUL_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { error: "Contentful webhook is not configured." },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : request.headers.get("x-contentful-webhook-secret") ?? "";

  if (!provided || !safeEqual(provided, secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  revalidateTag(CONTENTFUL_CACHE_TAG, "max");
  return Response.json({ revalidated: true });
}
