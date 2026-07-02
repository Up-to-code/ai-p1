"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Space = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  slug: string;
  visibility: "private" | "public" | "request_only";
  defaultProjectVisibility?: "private" | "space_members" | "organization";
  allowMemberProjectCreation?: boolean;
  createdAt: number;
  updatedAt: number;
};

type CreateSpaceInput = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  slug: string;
  visibility: "private" | "public" | "request_only";
  defaultProjectVisibility?: "private" | "space_members" | "organization";
  allowMemberProjectCreation?: boolean;
};

export function SpacesScreen() {
  const t = useTranslations("Spaces");
  const { toast } = useToast();
  const session = useAuthSession();
  const organizationId = session.organization.id ?? "";
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState<CreateSpaceInput>({
    name: "",
    slug: "",
    visibility: "private",
  });

  // Mock query - replace with actual Convex query when ready
  const spacesQuery = useQuery({
    queryKey: ["spaces", organizationId],
    queryFn: async () => {
      // TODO: Replace with actual Convex query
      return [] as Space[];
    },
    enabled: Boolean(organizationId),
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateSpaceInput) => {
      // TODO: Replace with actual Convex mutation
      console.log("Creating space:", input);
      return { id: "new-space-id" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces", organizationId] });
      setCreateDialogOpen(false);
      setFormData({ name: "", slug: "", visibility: "private" });
      toast({ title: "Space created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create space" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ spaceId, input }: { spaceId: string; input: Partial<CreateSpaceInput> }) => {
      // TODO: Replace with actual Convex mutation
      console.log("Updating space:", spaceId, input);
      return { id: spaceId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces", organizationId] });
      setEditingSpace(null);
      setFormData({ name: "", slug: "", visibility: "private" });
      toast({ title: "Space updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update space" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      // TODO: Replace with actual Convex mutation
      console.log("Deleting space:", spaceId);
      return { id: spaceId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces", organizationId] });
      toast({ title: "Space deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete space" });
    },
  });

  const handleCreate = () => {
    if (!formData.name || !formData.slug) {
      toast({ title: "Name and slug are required" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingSpace) return;
    updateMutation.mutate({ spaceId: editingSpace._id, input: formData });
  };

  const handleDelete = (spaceId: string) => {
    if (confirm("Are you sure you want to delete this space?")) {
      deleteMutation.mutate(spaceId);
    }
  };

  const openEditDialog = (space: Space) => {
    setEditingSpace(space);
    setFormData({
      name: space.name,
      slug: space.slug,
      description: space.description,
      icon: space.icon,
      color: space.color,
      visibility: space.visibility,
      defaultProjectVisibility: space.defaultProjectVisibility,
      allowMemberProjectCreation: space.allowMemberProjectCreation,
    });
  };

  const closeDialog = () => {
    setCreateDialogOpen(false);
    setEditingSpace(null);
    setFormData({ name: "", slug: "", visibility: "private" });
  };

  if (spacesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spaces</h1>
          <p className="text-muted-foreground">Manage your organization spaces</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Space
        </Button>
      </div>

      <div className="grid gap-4">
        {spacesQuery.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No spaces yet</h3>
            <p className="text-muted-foreground mb-4">Create your first space to organize your projects</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Space
            </Button>
          </div>
        ) : (
          spacesQuery.data?.map((space) => (
            <div
              key={space._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {space.icon && (
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-muted">
                    <span className="text-xl">{space.icon}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{space.name}</h3>
                  <p className="text-sm text-muted-foreground">{space.description || space.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {space.visibility}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(space)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(space._id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={createDialogOpen || !!editingSpace} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSpace ? "Edit Space" : "Create Space"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Engineering team workspace"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
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
            <div className="space-y-2">
              <Label htmlFor="defaultProjectVisibility">Default Project Visibility (optional)</Label>
              <Select
                value={formData.defaultProjectVisibility || "private"}
                onValueChange={(value: any) => setFormData({ ...formData, defaultProjectVisibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="space_members">Space Members</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={editingSpace ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingSpace ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
