import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot, Building2 } from "lucide-react";
import { getToken } from "@/lib/auth-server";
import { partnerAccountRepository } from "@/server/partnerAccount";
import { partnerMcpConnectionsRepository } from "@/server/mcp/connections";
import { McpConnectionsClient } from "@/components/portal/mcp/McpConnectionsClient";

export default async function McpPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/mcp");

  const account = await partnerAccountRepository.getCurrent(token);
  const connections = account.organization ? await partnerMcpConnectionsRepository.list(token).catch(() => []) : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">MCP</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">AI operator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Connect an assistant that can help create, update, delete, inspect, and submit your partner apps.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-border bg-card px-3 py-2 text-sm font-bold text-foreground">
          <Bot className="h-4 w-4 text-primary" />
          Partners-only
        </div>
      </div>

      {!account.organization ? (
        <div className="command-panel max-w-2xl p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Create a programmer organization first.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            MCP links belong to your Partners programmer organization. Create the organization, then return here to make an AI operator link.
          </p>
          <Link href="/dashboard/account" className="mt-5 inline-flex h-9 items-center justify-center rounded-[6px] bg-primary px-3 text-sm font-bold text-primary-foreground">
            Open account setup
          </Link>
        </div>
      ) : (
        <McpConnectionsClient initialConnections={connections} />
      )}
    </div>
  );
}
