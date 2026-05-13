export type PipelineOrderClient = {
  id: string;
  pipelineOrder?: number;
  updatedAt?: number;
};

function clientPipelineOrder(client: PipelineOrderClient, fallbackIndex: number) {
  return typeof client.pipelineOrder === "number" ? client.pipelineOrder : fallbackIndex + 1;
}

export function sortPipelineClients<TClient extends PipelineOrderClient>(clients: TClient[]) {
  return clients
    .map((client, index) => ({ client, index }))
    .sort((left, right) => {
      const leftOrder = clientPipelineOrder(left.client, left.index);
      const rightOrder = clientPipelineOrder(right.client, right.index);
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return (right.client.updatedAt ?? 0) - (left.client.updatedAt ?? 0);
    })
    .map(({ client }) => client);
}

export function nextPipelineOrder(stageClients: PipelineOrderClient[], movingClientId: string, targetIndex: number) {
  const ordered = sortPipelineClients(stageClients).filter((client) => client.id !== movingClientId);
  const boundedIndex = Math.max(0, Math.min(targetIndex, ordered.length));
  const previous = ordered[boundedIndex - 1];
  const next = ordered[boundedIndex];

  if (!previous && !next) return 1;
  if (!previous) return clientPipelineOrder(next, 0) - 1;
  if (!next) return clientPipelineOrder(previous, boundedIndex - 1) + 1;
  return (clientPipelineOrder(previous, boundedIndex - 1) + clientPipelineOrder(next, boundedIndex)) / 2;
}
