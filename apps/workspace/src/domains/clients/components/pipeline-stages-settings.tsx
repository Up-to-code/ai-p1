"use client";

import { useState } from "react";
import { ColorSwatch } from "@qentrah/ui";
import { Plus, Trash2, GripVertical, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCreatePipelineStage,
  useUpdatePipelineStage,
  useDeletePipelineStage,
  useReorderPipelineStages,
  type PipelineStage,
} from "@/domains/clients/api/pipeline-stages";
import type { Id } from "@convex/_generated/dataModel";

const PRESET_COLORS = [
  "#B4B2A9", "#EF9F27", "#F0997B", "#378ADD", "#639922", "#E24B4A",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

interface PipelineStagesSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  stages: PipelineStage[];
}

export function PipelineStagesSettings({
  open,
  onOpenChange,
  organizationId,
  stages,
}: PipelineStagesSettingsProps) {
  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showNewForm, setShowNewForm] = useState(false);

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  function startEdit(stage: PipelineStage) {
    setEditingId(stage._id);
    setEditName(stage.name);
    setEditColor(stage.color);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  }

  async function saveEdit(stageId: string) {
    await updateStage({ stageId: stageId as Id<"workflowStates">, name: editName, color: editColor });
    cancelEdit();
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    const key = newName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (sortedStages.some((s) => s.key === key)) return;
    const maxOrder = sortedStages.length > 0 ? Math.max(...sortedStages.map((s) => s.order)) + 1 : 0;
    await createStage({
      organizationId,
      key,
      name: newName.trim(),
      color: newColor,
      order: maxOrder,
    });
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setShowNewForm(false);
  }

  async function handleDelete(stageId: string) {
    await deleteStage({ stageId: stageId as Id<"workflowStates"> });
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const current = sortedStages[index];
    const prev = sortedStages[index - 1];
    await reorderStages({
      organizationId,
      stageOrders: [
        { stageId: current._id as Id<"workflowStates">, order: prev.order },
        { stageId: prev._id as Id<"workflowStates">, order: current.order },
      ],
    });
  }

  async function handleMoveDown(index: number) {
    if (index >= sortedStages.length - 1) return;
    const current = sortedStages[index];
    const next = sortedStages[index + 1];
    await reorderStages({
      organizationId,
      stageOrders: [
        { stageId: current._id as Id<"workflowStates">, order: next.order },
        { stageId: next._id as Id<"workflowStates">, order: current.order },
      ],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pipeline Stages</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto py-2">
          {sortedStages.map((stage, index) => (
            <div
              key={stage._id}
              className="flex items-center gap-2 rounded-lg border p-2 bg-background"
            >
              {editingId === stage._id ? (
                <>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3 rotate-180" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sortedStages.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3" />
                      </button>
                    </div>
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: editColor }}
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(stage._id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap max-w-[120px]">
                    {PRESET_COLORS.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        selected={editColor === color}
                        size="xs"
                        onClick={() => setEditColor(color)}
                        ariaLabel={`Color ${color}`}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => saveEdit(stage._id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3 rotate-180" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sortedStages.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3" />
                      </button>
                    </div>
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-medium">{stage.name}</span>
                    <span className="text-xs text-muted-foreground">({stage.key})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => startEdit(stage)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(stage._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}

          {showNewForm ? (
            <div className="flex items-center gap-2 rounded-lg border p-2 bg-background">
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ backgroundColor: newColor }}
                />
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Stage name"
                  className="h-7 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") setShowNewForm(false);
                  }}
                />
              </div>
              <div className="flex gap-1 flex-wrap max-w-[120px]">
                {PRESET_COLORS.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={newColor === color}
                    size="xs"
                    onClick={() => setNewColor(color)}
                    ariaLabel={`Color ${color}`}
                  />
                ))}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleAdd}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowNewForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
