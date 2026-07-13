import { handleWorkspaceMcpRequest } from "@/server/protocols/mcp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handleWorkspaceMcpRequest;
export const POST = handleWorkspaceMcpRequest;
export const OPTIONS = handleWorkspaceMcpRequest;
