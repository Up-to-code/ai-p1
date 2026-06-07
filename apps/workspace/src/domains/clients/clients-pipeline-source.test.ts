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
  const formSource = readSource("src/domains/clients/components/client-form.tsx");
  const sheetSource = readSource("src/domains/clients/components/client-sheet.tsx");
  const pipelineCommandSource = readSource("src/domains/clients/pipeline-command.ts");

  it("renders only active journey stages in the pipeline", () => {
    expect(viewModelSource).toContain('activePipelineStages = ["new", "qualified", "review", "negotiation"] as const');
    expect(viewModelSource).toContain("activeJourneyClients");
    expect(source).toContain("activePipelineStages");
    expect(source).toContain("activePipelineStages.map((stage)");
    expect(source).toContain("activeJourneyClientRows(searchedClients)");
  });

  it("keeps closed clients reachable from the normal table filter", () => {
    expect(viewModelSource).toContain('clientStageFilters = ["all", "active", "closed"] as const');
    expect(viewModelSource).toContain("clientsForStageFilter");
    expect(viewModelSource).toContain("normalizeClientPipelineStage(client.pipelineStage) === \"closed\"");
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
    expect(apiSource).toContain("pipelineStage: values.pipelineStage");
    expect(apiSource).toContain("pipelineOrder:");
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

  it("optimistically creates clients in the indexed cache with rollback and invalidation", () => {
    expect(apiSource).toContain("useCreateClientOptimisticMutation");
    expect(apiSource).toContain("provisionalClientFromFormValues(variables.values)");
    expect(apiSource).toContain("addClientToIndexData(data, optimisticClient)");
    expect(apiSource).toContain('toast({ title: "Client create failed. Reverted.", type: "error" })');
    expect(apiSource).toContain('toast({ title: "Client created.", type: "success" })');
    expect(pipelineCommandSource).toContain("export function addClientToIndexData");
    expect(pipelineCommandSource).toContain("export function provisionalClientFromFormValues");
    expect(formSource).toContain("useCreateClientOptimisticMutation(indexQueryKey)");
    expect(formSource).toContain("createClientMutation.mutate");
    expect(formSource).toContain("clientsIndexQueryBaseKey(account.organization.id)");
    expect(sheetSource).toContain("indexQueryKey?: readonly unknown[]");
    expect(sheetSource).toContain("indexQueryKey={indexQueryKey}");
    expect(source).toContain("indexQueryKey={clientsQuery.queryKey}");
  });

  it("routes footer and activity status controls through saved workspace paths", () => {
    expect(source).toContain("markClientClosed");
    expect(source).toContain("updateClientMutation.mutate({");
    expect(source).toContain('pipelineStage: "closed"');
    expect(source).toContain('setSearch("");');
    expect(source).toContain('setStageFilter("all");');
    expect(source).toContain('name="status" value="todo"');
    expect(source).not.toContain('name="status" value="open"');
  });

  it("uses translation-safe helpers for client enum labels", () => {
    expect(source).toContain("translateClientType");
    expect(source).toContain("translateClientStatus");
    expect(source).toContain("translateClientStage");
    expect(source).toContain("translateClientPriority");
    expect(source).toContain('translateClientStatus(t, client.status)');
    expect(source).toContain('translateClientLabel(t, "statuses", value, clientStatusValuesForTranslation);');
    expect(source).not.toContain("t(`types.${client.type}`)");
    expect(source).not.toContain("t(`stages.${client.pipelineStage}`)");
    expect(source).not.toContain("t(`priorities.${client.priority}`)");
    expect(source).not.toContain("t(`statuses.${client.status}`)");
    expect(source).toContain("name=\"status\" value=\"todo\"");
  });
});
