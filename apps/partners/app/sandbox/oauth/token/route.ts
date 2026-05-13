import { sandboxOAuthApp } from "@/server/sandbox/app";

export function POST(request: Request) {
  return sandboxOAuthApp.fetch(request);
}
