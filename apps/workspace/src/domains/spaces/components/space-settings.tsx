"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColorSwatch } from "@qentrah/ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { useQueryClient } from "@tanstack/react-query";
import { updateSpaceRequest, deleteSpaceRequest } from "../api/spaces";
import type { Space } from "../api/spaces";
import type { SpaceFormValues } from "../validation/space.schema";
import { MemberPicker } from "./member-picker";

interface SpaceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space;
}

const SPACE_COLORS = [
  "#4F80FF",
  "#2BB673",
  "#B78544",
  "#A55B52",
  "#8A5CFF",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function SpaceSettings({ open, onOpenChange, space }: SpaceSettingsProps) {
  const t = useTranslations("Projects");
  const { toast } = useToast();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId : undefined;

  const [values, setValues] = useState<SpaceFormValues>({
    name: space.name,
    slug: space.slug,
    icon: space.icon ?? "",
    color: space.color ?? "",
    visibility: space.visibility,
    description: space.description ?? "",
    defaultProjectVisibility: space.defaultProjectVisibility,
    allowMemberProjectCreation: space.allowMemberProjectCreation,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({
        name: space.name,
        slug: space.slug,
        icon: space.icon ?? "",
        color: space.color ?? "",
        visibility: space.visibility,
        description: space.description ?? "",
        defaultProjectVisibility: space.defaultProjectVisibility,
        allowMemberProjectCreation: space.allowMemberProjectCreation,
      });
    }
  }, [open, space]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !values.name.trim() || !values.slug.trim()) return;

    setIsSubmitting(true);
    try {
      await updateSpaceRequest(orgId, space.id, values);
      queryClient.invalidateQueries({ queryKey: ["spaces", orgId] });
      queryClient.invalidateQueries({ queryKey: ["space", orgId, space.id] });
      toast({
        title: "Space updated",
        type: "success",
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update space";
      toast({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!orgId) return;

    setIsSubmitting(true);
    try {
      await deleteSpaceRequest(orgId, space.id);
      queryClient.invalidateQueries({ queryKey: ["spaces", orgId] });
      toast({
        title: "Space deleted",
        type: "success",
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete space";
      toast({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Space Settings</DialogTitle>
          <DialogDescription>
            Configure your space settings. Changes are saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={values.slug}
              onChange={(e) => setValues({ ...values, slug: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {SPACE_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={values.color === color}
                  size="md"
                  onClick={() => setValues({ ...values, color })}
                  ariaLabel={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <Select
              value={values.visibility}
              onValueChange={(value: string | null) => {
                setValues({
                  ...values,
                  visibility: value as any,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="request_only">Request Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
            >
              Delete Space
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !values.name.trim()}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Space?</DialogTitle>
                <DialogDescription>
                  This will remove the space but keep all tasks and documents. They will be moved to the
                  project level.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
