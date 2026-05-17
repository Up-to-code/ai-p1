import { NextRequest, NextResponse } from "next/server";
import { loadQentrahProjects } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession, resourceFiltersFromRequest } from "../route-helpers";

export async function GET(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await loadQentrahProjects(session, resourceFiltersFromRequest(request)));
  } catch (error) {
    return errorResponse(error);
  }
}
