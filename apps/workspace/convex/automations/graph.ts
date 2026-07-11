type GraphNode = { id: string; kind: "trigger" | "action" };
type GraphEdge = { source: string; target: string };

export function orderedReachableActions<TNode extends GraphNode>(nodes: TNode[], edges: GraphEdge[]) {
  const trigger = nodes.find((node) => node.kind === "trigger");
  if (!trigger) return [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const targetsBySource = new Map<string, string[]>();
  for (const edge of edges) {
    targetsBySource.set(edge.source, [...(targetsBySource.get(edge.source) ?? []), edge.target]);
  }
  const visited = new Set<string>([trigger.id]);
  const queue = [...(targetsBySource.get(trigger.id) ?? [])];
  const actions: TNode[] = [];
  while (queue.length) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const node = nodeById.get(id);
    if (!node) continue;
    if (node.kind === "action") actions.push(node);
    queue.push(...(targetsBySource.get(id) ?? []));
  }
  return actions;
}

export function graphProblem(nodes: GraphNode[], edges: GraphEdge[]) {
  const trigger = nodes.find((node) => node.kind === "trigger");
  if (!trigger) return "A workflow needs a trigger.";
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if ((adjacency.get(id) ?? []).some(visit)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  if (visit(trigger.id)) return "Workflow lines cannot create a cycle.";
  const reachable = new Set([trigger.id, ...orderedReachableActions(nodes, edges).map((node) => node.id)]);
  if (nodes.some((node) => !reachable.has(node.id))) return "Every action must be connected to the trigger.";
  return null;
}
