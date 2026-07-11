type PositionedNode = { id: string; x: number; y: number };
type Viewport = { x: number; y: number; zoom: number };

export function mergeAutomationPositions<TNode extends PositionedNode>(
  nodes: TNode[],
  positions: PositionedNode[],
): TNode[] | null {
  const byId = new Map(positions.map((position) => [position.id, position]));
  if (byId.size !== nodes.length || nodes.some((node) => !byId.has(node.id))) return null;
  return nodes.map((node) => {
    const position = byId.get(node.id)!;
    return { ...node, x: position.x, y: position.y };
  });
}

export function automationLayoutUnchanged(
  previousNodes: PositionedNode[],
  nextNodes: PositionedNode[],
  previousViewport: Viewport | undefined,
  nextViewport: Viewport,
) {
  return nextNodes.every((node, index) =>
    node.x === previousNodes[index]?.x && node.y === previousNodes[index]?.y,
  ) && previousViewport?.x === nextViewport.x
    && previousViewport?.y === nextViewport.y
    && previousViewport?.zoom === nextViewport.zoom;
}
