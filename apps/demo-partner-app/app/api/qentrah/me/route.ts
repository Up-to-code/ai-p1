import { NextResponse } from "next/server";
import { loadQentrahMe } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession } from "../route-helpers";

export async function GET() {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await loadQentrahMe(session));
  } catch (error) {
    return errorResponse(error);
  }
}
