import { NextRequest, NextResponse } from "next/server";
import { createQentrahClient, loadQentrahClients } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession, resourceFiltersFromRequest } from "../route-helpers";

export async function GET(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await loadQentrahClients(session, resourceFiltersFromRequest(request)));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    return NextResponse.json(await createQentrahClient(session, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}
