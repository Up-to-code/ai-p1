"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { Play, Plus, Save, Trash2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutomationInspector } from "./automation-inspector";
import { AutomationStepNode } from "./automation-step-node";
import { useAutomationWorkspace } from "../hooks/use-automation-workspace";
import { AutomationLibraryDialog } from "./automation-library-dialog";
import { AutomationComponentPalette } from "./automation-component-palette";
import { AutomationSaveStatus } from "./automation-save-status";
import { AutomationOperations } from "./automation-operations";

const nodeTypes = { automationStep: AutomationStepNode };

function AutomationsWorkspace({ automationId }: { automationId?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const workspace = useAutomationWorkspace(automationId);
  const loading = workspace.workflows === undefined;
  const [libraryMode, setLibraryMode] = useState<
    "template" | "component" | null
  >(null);
  const [insertEdgeId, setInsertEdgeId] = useState<string | undefined>();

  useEffect(() => {
    if (
      !workspace.selectedId ||
      String(workspace.selectedId) === automationId ||
      pathname.includes("?")
    ) {
      return;
    }
    router.replace(`/${locale}/automations/${workspace.selectedId}`);
  }, [automationId, locale, pathname, router, workspace.selectedId]);

  const openComponentLibrary = (edgeId?: string) => {
    setInsertEdgeId(edgeId);
    setLibraryMode("component");
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[560px] flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Workflow className="size-3.5" />
          </div>
          <select
            aria-label="Automation"
            className="h-9 max-w-64 rounded-lg border bg-card px-2.5 text-sm font-semibold"
            value={workspace.selectedId ?? ""}
            onChange={(event) =>
              workspace.setSelectedId(event.target.value as never)
            }
          >
            {!workspace.workflows?.length && (
              <option value="">Automations</option>
            )}
            {workspace.workflows?.map((workflow) => (
              <option key={workflow._id} value={workflow._id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLibraryMode("template")}
        >
          <Plus className="size-4" /> New
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {workspace.selectedWorkflow && (
            <AutomationSaveStatus status={workspace.persistenceStatus} />
          )}
          {workspace.selectedWorkflow && (
            <label className="flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold">
              <input
                type="checkbox"
                checked={workspace.selectedWorkflow.enabled}
                onChange={(event) =>
                  void workspace.setEnabled(event.target.checked)
                }
              />
              Active
            </label>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={!workspace.selectedWorkflow}
            onClick={() => void workspace.run()}
          >
            <Play className="size-4" /> Test run
          </Button>
          <Button
            size="sm"
            disabled={
              !workspace.selectedWorkflow ||
              workspace.isSaving ||
              !workspace.hasUnsavedChanges
            }
            onClick={() => void workspace.save()}
          >
            <Save className="size-4" /> Save
          </Button>
        </div>
      </header>

      {!workspace.selectedWorkflow ? (
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Workflow />
            </div>
            <h1 className="text-2xl font-bold">Build your first automation</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start with the complete Google Sheets → custom agent → WhatsApp
              workflow, or compose one from reusable actions.
            </p>
            <Button
              className="mt-5"
              onClick={() => setLibraryMode("template")}
              disabled={loading}
            >
              <Plus className="size-4" /> Create automation
            </Button>
          </div>
        </main>
      ) : (
        <div className="flex min-h-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-12 items-center gap-2.5 border-b bg-card px-4">
              <Input
                className="h-8 max-w-xs border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0"
                value={workspace.name}
                onChange={(event) => workspace.setName(event.target.value)}
              />
              <Input
                className="max-w-md border-0 bg-transparent text-xs text-muted-foreground shadow-none focus-visible:ring-0"
                value={workspace.description}
                onChange={(event) =>
                  workspace.setDescription(event.target.value)
                }
                placeholder="Add a description…"
              />
              <Button
                className="ml-auto"
                variant="outline"
                size="sm"
                onClick={() => openComponentLibrary()}
              >
                <Plus className="size-4" /> Add action
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete automation"
                onClick={() => void workspace.remove()}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 bg-muted/30">
              <AutomationComponentPalette
                onAdd={(component) => workspace.addComponent(component)}
              />
              <div className="min-w-0 flex-1">
                <ReactFlow
                  key={workspace.selectedId}
                  nodes={workspace.nodes}
                  edges={workspace.edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={workspace.onNodesChange}
                  onEdgesChange={workspace.onEdgesChange}
                  onConnect={workspace.onConnect}
                  onNodeDragStop={() => workspace.persistLayout()}
                  onMoveEnd={(_, viewport) =>
                    workspace.persistLayout(viewport)
                  }
                  onNodeClick={(_, node) =>
                    workspace.setSelectedNodeId(node.id)
                  }
                  onPaneClick={() => workspace.setSelectedNodeId(null)}
                  onEdgeClick={(event, edge) => {
                    if (event.shiftKey) openComponentLibrary(edge.id);
                  }}
                  defaultViewport={workspace.initialViewport}
                  fitView={!workspace.selectedWorkflow.viewport}
                  fitViewOptions={{ padding: 0.25, maxZoom: 0.9 }}
                  minZoom={0.3}
                  maxZoom={1.5}
                  defaultEdgeOptions={{
                    animated: true,
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 16,
                    },
                    style: { strokeWidth: 1.75 },
                  }}
                  connectionLineStyle={{
                    strokeWidth: 1.75,
                    stroke: "var(--primary)",
                  }}
                  snapToGrid
                  snapGrid={[20, 20]}
                  selectionOnDrag
                  deleteKeyCode={["Backspace", "Delete"]}
                >
                  <Background gap={20} size={1} />
                  <Controls />
                  <MiniMap pannable zoomable className="!bg-card" />
                </ReactFlow>
              </div>
            </div>
          </section>
          <AutomationInspector
            organizationId={workspace.organizationId ?? undefined}
            node={workspace.selectedNode}
            workflow={workspace.selectedWorkflow}
            onChange={workspace.updateSelectedNode}
          />
        </div>
      )}

      <AutomationLibraryDialog
        open={libraryMode !== null}
        mode={libraryMode ?? "template"}
        onOpenChange={(open) => {
          if (!open) {
            setLibraryMode(null);
            setInsertEdgeId(undefined);
          }
        }}
        onSelectTemplate={workspace.createFromTemplate}
        onSelectComponent={(component) =>
          workspace.addComponent(component, insertEdgeId)
        }
      />
    </div>
  );
}

export function AutomationsScreen({ automationId }: { automationId?: string }) {
  const view = useSearchParams().get("view") ?? "workflows";
  if (
    [
      "active-runs",
      "approvals",
      "failures",
      "history",
      "webhooks",
      "connections",
      "usage",
    ].includes(view)
  ) {
    return <AutomationOperations view={view} />;
  }
  return (
    <ReactFlowProvider>
      <AutomationsWorkspace automationId={automationId} />
    </ReactFlowProvider>
  );
}
