"use client";

import React, { useState } from "react";
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
import { createSpaceRequest } from "../api/spaces";
import type { SpaceFormValues } from "../validation/space.schema";
import { MemberPicker } from "./member-picker";

interface SpaceCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function SpaceCreateForm({ open, onOpenChange }: SpaceCreateFormProps) {
  const t = useTranslations("Projects");
  const { toast } = useToast();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId : undefined;

  const [values, setValues] = useState<SpaceFormValues>({
    name: "",
    slug: "",
    visibility: "private",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setValues({ ...values, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !values.name.trim() || !values.slug.trim()) return;

    setIsSubmitting(true);
    try {
      await createSpaceRequest(orgId, values);
      queryClient.invalidateQueries({ queryKey: ["spaces", orgId] });
      toast({
        title: "Space created",
        type: "success",
      });
      onOpenChange(false);
      setValues({ name: "", slug: "", visibility: "private" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create space";
      toast({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Space</DialogTitle>
          <DialogDescription>
            Create a new space to organize tasks and documents within this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Marketing, Design, Development"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={values.slug}
              onChange={(e) => setValues({ ...values, slug: e.target.value })}
              placeholder="e.g., marketing, design, development"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier. Used in workspace links.
            </p>
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
              {isSubmitting ? "Creating..." : "Create Space"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
