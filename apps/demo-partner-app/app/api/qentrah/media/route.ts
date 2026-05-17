import { NextRequest, NextResponse } from "next/server";
import { loadQentrahMedia } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession, resourceFiltersFromRequest } from "../route-helpers";

export async function GET(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  const url = new URL(request.url);
  const resourceType = url.searchParams.get("resourceType")?.trim() ?? "";
  const resourceId = url.searchParams.get("resourceId")?.trim() ?? "";
  if (!resourceType || !resourceId) {
    return NextResponse.json({ error: "media_filter_required", message: "Set resourceType and resourceId to load media." }, { status: 400 });
  }
  try {
    return NextResponse.json(await loadQentrahMedia(session, {
       ...resourceFiltersFromRequest(request),
      resourceType,
      resourceId,
    }));
  } catch (error) {
    return errorResponse(error);
  }
}
