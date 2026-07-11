"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type Viewport,
} from "@xyflow/react";
import { useOrganizationContext } from "@/domains/auth/organization-context";
import { useToast } from "@/components/ui/toast";
import type { AutomationNodeData, AutomationPersistenceStatus, AutomationRecord } from "../types";
import type { AutomationComponentDefinition, AutomationTemplate } from "../catalog";
import { componentById } from "../catalog";
import { logger } from "@/lib/logger";

type LayoutPayload = {
  positions: Array<{ id: string; x: number; y: number }>;
  viewport: Viewport;
  signature: string;
};

const defaultViewport: Viewport = { x: 0, y: 0, zoom: 0.9 };

function layoutSignature(positions: LayoutPayload["positions"], viewport: Viewport) {
  return JSON.stringify({ positions, viewport });
}

function toCanvasNodes(workflow: AutomationRecord): Node<AutomationNodeData>[] {
  return workflow.nodes.map((node) => ({
    id: node.id,
    type: "automationStep",
    position: { x: node.x, y: node.y },
    data: { kind: node.kind, type: node.type, label: node.label, config: node.config },
  }));
}

export function useAutomationWorkspace() {
  const organization = useOrganizationContext();
  const toast = useToast();
  const workflows = useQuery(
    api.automations.read.list,
    organization.id ? { organizationId: organization.id } : "skip",
  ) as AutomationRecord[] | undefined;
  const createWorkflow = useMutation(api.automations.write.create);
  const saveWorkflow = useMutation(api.automations.write.save);
  const saveLayoutMutation = useMutation(api.automations.write.saveLayout);
  const setEnabled = useMutation(api.automations.write.setEnabled);
  const removeWorkflow = useMutation(api.automations.write.remove);
  const runWorkflow = useMutation(api.automations.execute.runManual);
  const [selectedId, setSelectedId] = useState<Id<"automations"> | null>(null);
  const [nodes, setNodes] = useState<Node<AutomationNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [contentRevision, setContentRevision] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [persistenceStatus, setPersistenceStatus] = useState<AutomationPersistenceStatus>("saved");
  const dirtyRef = useRef(false);
  const hydratedWorkflowIdRef = useRef<string | null>(null);
  const nodesRef = useRef(nodes);
  const viewportRef = useRef<Viewport>(defaultViewport);
  const lastLayoutSignatureRef = useRef("");
  const pendingLayoutRef = useRef<LayoutPayload | null>(null);
  const layoutSavingRef = useRef(false);
  nodesRef.current = nodes;

  const selectedWorkflow = useMemo(
    () => workflows?.find((workflow) => workflow._id === selectedId) ?? null,
    [selectedId, workflows],
  );

  useEffect(() => {
    if (!selectedId && workflows?.[0]) setSelectedId(workflows[0]._id);
  }, [selectedId, workflows]);

  useEffect(() => {
    if (!selectedWorkflow) return;
    const serverRevision = selectedWorkflow.contentRevision ?? 0;
    const isNewWorkflow = hydratedWorkflowIdRef.current !== selectedWorkflow._id;
    if (!isNewWorkflow && (dirtyRef.current || serverRevision <= contentRevision)) return;
    setNodes(toCanvasNodes(selectedWorkflow));
    setEdges(selectedWorkflow.edges);
    setName(selectedWorkflow.name);
    setDescription(selectedWorkflow.description ?? "");
    setContentRevision(serverRevision);
    const viewport = selectedWorkflow.viewport ?? defaultViewport;
    viewportRef.current = viewport;
    const positions = selectedWorkflow.nodes.map((node) => ({ id: node.id, x: node.x, y: node.y }));
    lastLayoutSignatureRef.current = layoutSignature(positions, viewport);
    hydratedWorkflowIdRef.current = selectedWorkflow._id;
    dirtyRef.current = false;
    setHasUnsavedChanges(false);
    setPersistenceStatus("saved");
    setSelectedNodeId(null);
  }, [contentRevision, selectedWorkflow]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setHasUnsavedChanges(true);
    setPersistenceStatus("unsaved");
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<AutomationNodeData>>[]) => {
      if (changes.some((change) => change.type === "remove" || change.type === "add" || change.type === "replace")) markDirty();
      setNodes((current) => applyNodeChanges(changes, current));
    },
    [markDirty],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some((change) => change.type === "remove" || change.type === "add" || change.type === "replace")) markDirty();
      setEdges((current) => applyEdgeChanges(changes, current));
    },
    [markDirty],
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      markDirty();
      setEdges((current) => addEdge({ ...connection, animated: true }, current));
    },
    [markDirty],
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const updateSelectedNode = useCallback(
    (patch: Partial<AutomationNodeData>) => {
      if (!selectedNodeId) return;
      markDirty();
      setNodes((current) =>
        current.map((node) =>
          node.id === selectedNodeId ? { ...node, data: { ...node.data, ...patch } } : node,
        ),
      );
    },
    [markDirty, selectedNodeId],
  );

  const addComponent = useCallback((definition: AutomationComponentDefinition, edgeId?: string) => {
    markDirty();
    const id = `action-${crypto.randomUUID()}`;
    const defaultSource = [...nodes].sort((left, right) => right.position.x - left.position.x)[0];
    setNodes((current) => {
      const edge = edgeId ? edges.find((candidate) => candidate.id === edgeId) : undefined;
      const source = edge ? current.find((node) => node.id === edge.source) : undefined;
      const target = edge ? current.find((node) => node.id === edge.target) : undefined;
      const position = source && target
        ? { x: (source.position.x + target.position.x) / 2, y: (source.position.y + target.position.y) / 2 + 90 }
        : { x: 440 + current.length * 60, y: 140 + current.length * 48 };
      return [...current, {
        id,
        type: "automationStep",
        position,
        data: {
          kind: definition.kind,
          type: definition.id,
          label: definition.label,
          config: { ...definition.defaultConfig },
        },
      }];
    });
    if (edgeId) {
      setEdges((current) => {
        const edge = current.find((candidate) => candidate.id === edgeId);
        if (!edge) return current;
        return [
          ...current.filter((candidate) => candidate.id !== edgeId),
          { id: `${edge.source}-${id}`, source: edge.source, target: id, animated: true },
          { id: `${id}-${edge.target}`, source: id, target: edge.target, animated: true },
        ];
      });
    } else if (defaultSource) {
      setEdges((current) => [
        ...current,
        { id: `${defaultSource.id}-${id}`, source: defaultSource.id, target: id, animated: true },
      ]);
    }
    setSelectedNodeId(id);
  }, [edges, markDirty, nodes]);

  const createFromTemplate = useCallback(async (template: AutomationTemplate) => {
    if (!organization.id) return;
    try {
      const trigger = componentById(template.trigger);
      const action = componentById(template.action);
      if (!trigger || !action) return;
      const id = await createWorkflow({
        organizationId: organization.id,
        name: template.name,
        description: template.description,
        nodes: [
          { id: "trigger-1", kind: "trigger", type: trigger.id, label: trigger.label, x: 80, y: 180, config: trigger.defaultConfig },
          { id: "action-1", kind: "action", type: action.id, label: action.label, x: 440, y: 180, config: action.defaultConfig },
        ],
        edges: [{ id: "trigger-1-action-1", source: "trigger-1", target: "action-1" }],
      });
      setSelectedId(id);
    } catch (error) {
      toast.toast({ title: "Could not create automation", description: error instanceof Error ? error.message : undefined, type: "error" });
    }
  }, [createWorkflow, organization.id, toast]);

  const drainLayoutSaves = useCallback(async () => {
    if (layoutSavingRef.current || !organization.id || !selectedId) return;
    layoutSavingRef.current = true;
    try {
      while (pendingLayoutRef.current) {
        const payload = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        setPersistenceStatus("saving");
        await saveLayoutMutation({
          organizationId: organization.id,
          automationId: selectedId,
          positions: payload.positions,
          viewport: payload.viewport,
        });
        lastLayoutSignatureRef.current = payload.signature;
      }
      setPersistenceStatus(dirtyRef.current ? "unsaved" : "saved");
    } catch (error) {
      setPersistenceStatus("error");
      logger.error("automation.layout_save_failed", { automationId: selectedId, error });
    } finally {
      layoutSavingRef.current = false;
      if (pendingLayoutRef.current) void drainLayoutSaves();
    }
  }, [organization.id, saveLayoutMutation, selectedId]);

  const persistLayout = useCallback((viewport = viewportRef.current) => {
    if (!selectedId || dirtyRef.current) return;
    viewportRef.current = viewport;
    const positions = nodesRef.current.map((node) => ({ id: node.id, x: node.position.x, y: node.position.y }));
    const signature = layoutSignature(positions, viewport);
    if (signature === lastLayoutSignatureRef.current) return;
    pendingLayoutRef.current = { positions, viewport, signature };
    void drainLayoutSaves();
  }, [drainLayoutSaves, selectedId]);

  const save = useCallback(async (options?: { silent?: boolean }) => {
    if (!organization.id || !selectedId) return;
    setIsSaving(true);
    setPersistenceStatus("saving");
    try {
      const result = await saveWorkflow({
        organizationId: organization.id,
        automationId: selectedId,
        name,
        description: description || undefined,
        nodes: nodes.map((node) => ({
          id: node.id,
          kind: node.data.kind,
          type: node.data.type,
          label: node.data.label,
          x: node.position.x,
          y: node.position.y,
          config: node.data.config,
        })),
        edges: edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
        viewport: viewportRef.current,
        expectedRevision: contentRevision,
      });
      setContentRevision(result.revision);
      dirtyRef.current = false;
      setHasUnsavedChanges(false);
      setPersistenceStatus("saved");
      const positions = nodes.map((node) => ({ id: node.id, x: node.position.x, y: node.position.y }));
      lastLayoutSignatureRef.current = layoutSignature(positions, viewportRef.current);
      if (!options?.silent) toast.toast({ title: "Automation saved", type: "success" });
    } catch (error) {
      setPersistenceStatus("error");
      logger.error("automation.content_save_failed", { automationId: selectedId, error });
      if (!options?.silent) toast.toast({ title: "Could not save automation", description: error instanceof Error ? error.message : undefined, type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [contentRevision, description, edges, name, nodes, organization.id, saveWorkflow, selectedId, toast]);

  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) return;
    const timer = window.setTimeout(() => void save({ silent: true }), 900);
    return () => window.clearTimeout(timer);
  }, [hasUnsavedChanges, isSaving, save]);

  const changeName = useCallback((value: string) => {
    setName(value);
    markDirty();
  }, [markDirty]);

  const changeDescription = useCallback((value: string) => {
    setDescription(value);
    markDirty();
  }, [markDirty]);

  return {
    organizationId: organization.id,
    workflows,
    selectedId,
    selectedWorkflow,
    selectedNode,
    nodes,
    edges,
    name,
    description,
    isSaving,
    hasUnsavedChanges,
    persistenceStatus,
    initialViewport: selectedWorkflow?.viewport ?? defaultViewport,
    setSelectedId,
    setSelectedNodeId,
    setName: changeName,
    setDescription: changeDescription,
    onNodesChange,
    onEdgesChange,
    onConnect,
    persistLayout,
    updateSelectedNode,
    addComponent,
    createFromTemplate,
    save,
    setEnabled: async (enabled: boolean) => {
      if (!organization.id || !selectedId) return;
      await setEnabled({ organizationId: organization.id, automationId: selectedId, enabled });
    },
    remove: async () => {
      if (!organization.id || !selectedId) return;
      await removeWorkflow({ organizationId: organization.id, automationId: selectedId });
      setSelectedId(null);
    },
    run: async () => {
      if (!organization.id || !selectedId) return;
      const result = await runWorkflow({ organizationId: organization.id, automationId: selectedId });
      toast.toast({ title: result.status === "success" ? "Automation ran" : "Automation failed", description: result.message, type: result.status === "success" ? "success" : "error" });
    },
  };
}
