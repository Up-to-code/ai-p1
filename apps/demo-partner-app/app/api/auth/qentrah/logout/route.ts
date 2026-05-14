import { NextResponse } from "next/server";
import { clearTokenSession } from "@/lib/session";

export async function POST(request: Request) {
  await clearTokenSession();
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
