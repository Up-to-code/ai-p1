import { NextResponse } from "next/server";
import { loadQentrahMe } from "@/lib/workspace-api";
import { readTokenSession } from "@/lib/session";

export async function GET() {
  const session = await readTokenSession();
  if (!session) return NextResponse.json({ error: "missing_bearer" }, { status: 401 });
  try {
    return NextResponse.json(await loadQentrahMe(session));
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "workspace_api_error";
    return NextResponse.json({ error: code, message: error instanceof Error ? error.message : code }, { status });
  }
}
