import { NextRequest, NextResponse } from "next/server";
import { createAnanClient, loadAnanClients } from "@/lib/hub-api";
import { readTokenSession } from "@/lib/session";

function errorResponse(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "hub_api_error";
  return NextResponse.json({ error: code, message: error instanceof Error ? error.message : code }, { status });
}

export async function GET() {
  const session = await readTokenSession();
  if (!session) return NextResponse.json({ error: "missing_bearer" }, { status: 401 });
  try {
    return NextResponse.json(await loadAnanClients(session));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await readTokenSession();
  if (!session) return NextResponse.json({ error: "missing_bearer" }, { status: 401 });
  try {
    return NextResponse.json(await createAnanClient(session, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}
