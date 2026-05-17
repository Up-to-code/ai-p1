import { NextRequest, NextResponse } from "next/server";
import { loadQentrahTasks } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession, resourceFiltersFromRequest } from "../route-helpers";

export async function GET(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await loadQentrahTasks(session, resourceFiltersFromRequest(request)));
  } catch (error) {
    return errorResponse(error);
  }
}
