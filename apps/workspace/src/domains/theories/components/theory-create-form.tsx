"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TheoryFormValues, TheoryRecord } from "../theories.types";
import { THEORY_CATEGORIES, defaultTheoryFormValues } from "../theories.constants";

interface TheoryCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TheoryFormValues) => Promise<void>;
  initialValues?: TheoryRecord;
}

export function TheoryCreateForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: TheoryCreateFormProps) {
  const [values, setValues] = useState<TheoryFormValues>(
    initialValues
      ? {
          title: initialValues.title,
          content: initialValues.content,
          isPrivate: initialValues.isPrivate,
          source: initialValues.source,
          category: initialValues.category ?? "",
          tags: (initialValues.tags ?? []).join(", "),
        }
      : { ...defaultTheoryFormValues },
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
      if (!initialValues) {
        setValues({ ...defaultTheoryFormValues });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Theory" : "New Theory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              placeholder="Theory title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={values.content}
              onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
              placeholder="Describe your theory..."
              rows={5}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={values.category}
                onValueChange={(v: string) => setValues((prev) => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {THEORY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="isPrivate"
                checked={values.isPrivate}
                onCheckedChange={(checked: boolean) =>
                  setValues((v) => ({ ...v, isPrivate: checked }))
                }
              />
              <Label htmlFor="isPrivate" className="text-sm">
                Private
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={values.tags}
              onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
              placeholder="e.g. AI, strategy, insights"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : initialValues ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
