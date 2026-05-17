import { NextRequest, NextResponse } from "next/server";
import { deleteQentrahClient, updateQentrahClient } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession } from "../../route-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    const { clientId } = await params;
    return NextResponse.json(await updateQentrahClient(session, clientId, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    const { clientId } = await params;
    return NextResponse.json(await deleteQentrahClient(session, clientId));
  } catch (error) {
    return errorResponse(error);
  }
}
