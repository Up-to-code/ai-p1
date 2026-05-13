import { sandboxOAuthApp } from "@/server/sandbox/app";

export function GET(request: Request) {
  return sandboxOAuthApp.fetch(request);
}
