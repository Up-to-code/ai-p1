import { NextRequest, NextResponse } from "next/server";
import { loadQentrahCalendar } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession, resourceFiltersFromRequest } from "../route-helpers";

export async function GET(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await loadQentrahCalendar(session, resourceFiltersFromRequest(request)));
  } catch (error) {
    return errorResponse(error);
  }
}
