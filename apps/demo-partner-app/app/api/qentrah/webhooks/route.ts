import { NextRequest, NextResponse } from "next/server";
import { sendQentrahWebhook } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession } from "../route-helpers";

export async function POST(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await sendQentrahWebhook(session, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}
