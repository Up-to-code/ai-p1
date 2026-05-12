import { NextRequest, NextResponse } from "next/server";
import { updateAnanClient } from "@/lib/hub-api";
import { readTokenSession } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const session = await readTokenSession();
  if (!session) return NextResponse.json({ error: "missing_bearer" }, { status: 401 });
  try {
    const { clientId } = await params;
    return NextResponse.json(await updateAnanClient(session, clientId, await request.json()));
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "hub_api_error";
    return NextResponse.json({ error: code, message: error instanceof Error ? error.message : code }, { status });
  }
}
