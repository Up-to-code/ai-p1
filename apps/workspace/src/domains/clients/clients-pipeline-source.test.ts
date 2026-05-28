import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("client pipeline screen source", () => {
  const source = readSource("src/domains/clients/components/clients-screens.tsx");
  const viewModelSource = readSource("src/domains/clients/client-view-model.ts");
  const apiSource = readSource("src/domains/clients/api/clients.ts");

  it("renders only active journey stages in the pipeline", () => {
    expect(viewModelSource).toContain('activePipelineStages = ["new", "qualified", "viewing", "negotiation"] as const');
    expect(viewModelSource).toContain("activeJourneyClients");
    expect(source).toContain("activePipelineStages");
    expect(source).toContain("activePipelineStages.map((stage)");
    expect(source).toContain("activeJourneyClientRows(searchedClients)");
  });

  it("keeps closed clients reachable from the normal table filter", () => {
    expect(viewModelSource).toContain('clientStageFilters = ["all", "active", "closed"] as const');
    expect(viewModelSource).toContain("clientsForStageFilter");
    expect(viewModelSource).toContain("client.pipelineStage === \"closed\"");
    expect(source).toContain("clientStageFilters");
    expect(source).toContain("clientsForStageFilter(searchedClients, stageFilter)");
    expect(source).toContain('t(`stageFilters.${stage}`)');
  });

  it("persists drag/drop by sending both stage and order", () => {
    expect(source).toContain("useMoveClientInPipelineMutation(clientsQuery.queryKey)");
    expect(source).toContain("moveClientMutation.mutate");
    expect(apiSource).toContain("nextPipelineOrder(variables.stageClients, variables.client.id, variables.targetIndex)");
    expect(apiSource).toContain("pipelineStage: variables.stage");
    expect(apiSource).toContain("pipelineOrder,");
    expect(apiSource).toContain("updateClientRequest(organizationId, client.id, clientFormValuesForPipeline(client, stage, pipelineOrder))");
  });

  it("uses TanStack Query optimistic cache rollback for failed moves", () => {
    expect(apiSource).toContain("useMutation");
    expect(apiSource).toContain("queryClient.setQueryData<ClientsIndexData>");
    expect(apiSource).toContain("patchClientInIndexData(data, variables.client.id");
    expect(apiSource).toContain("queryClient.setQueryData(queryKey, context.previousData)");
    expect(apiSource).toContain('toast({ title: "Move failed. Reverted.", type: "error" })');
    expect(apiSource).toContain("invalidateQueries({ queryKey: clientsIndexQueryBaseKey(variables.organizationId) })");
  });

  it("optimistically removes and edits clients in the indexed cache with rollback", () => {
    expect(apiSource).toContain("useUpdateClientOptimisticMutation");
    expect(apiSource).toContain("useDeleteClientOptimisticMutation");
    expect(apiSource).toContain("removeClientFromIndexData(data, variables.clientId)");
    expect(apiSource).toContain('toast({ title: "Client delete failed. Reverted.", type: "error" })');
    expect(apiSource).toContain('toast({ title: "Client update failed. Reverted.", type: "error" })');
    expect(source).toContain("useDeleteClientOptimisticMutation(clientsQuery.queryKey)");
    expect(source).toContain("useUpdateClientOptimisticMutation(clientsQuery.queryKey)");
    expect(source).toContain("deleteClientMutation.mutate({ organizationId: account.organization.id, clientId })");
    expect(source).toContain("updateClientMutation.mutate({");
  });
});
