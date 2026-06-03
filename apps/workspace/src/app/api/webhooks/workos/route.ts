import { NextResponse, type NextRequest } from "next/server";
import { api } from "@convex/_generated/api";
import { convexCalls } from "@/server/convex/http-client";
import { getWorkOSClient } from "@/server/auth/workos/client";
import { workosRuntimeConfig } from "@/packages/config";

export async function POST(request: NextRequest) {
  if (!workosRuntimeConfig.webhookSecret) {
    return NextResponse.json({ error: "WorkOS webhook secret is not configured." }, { status: 500 });
  }

  const payload = await request.text();
  const sigHeader = request.headers.get("workos-signature") ?? request.headers.get("x-workos-signature") ?? "";
  if (!sigHeader) return NextResponse.json({ error: "WorkOS webhook signature is required." }, { status: 401 });

  try {
    const event = await getWorkOSClient().webhooks.constructEvent({
      payload,
      sigHeader,
      secret: workosRuntimeConfig.webhookSecret,
    });
    const result = await convexCalls.mutation(api.workosAuth.processWebhookEvent, {
      event: {
        id: event.id,
        event: event.event,
        data: event.data as Record<string, unknown>,
        created_at: "createdAt" in event && typeof event.createdAt === "string" ? event.createdAt : undefined,
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "WorkOS webhook failed." },
      { status: 401 },
    );
  }
}
