"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { CustomField } from "../docs.types";

interface CustomFieldsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFields: CustomField[];
  onSave: (fields: CustomField[]) => void;
}

export function CustomFieldsModal({
  open,
  onOpenChange,
  customFields,
  onSave,
}: CustomFieldsModalProps) {
  const [fields, setFields] = useState<CustomField[]>(customFields);

  const handleAddField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      name: "",
      type: "text",
      value: "",
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<CustomField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleSave = () => {
    onSave(fields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom Fields</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card">
              <div className="flex-1 space-y-2">
                <Input
                  value={field.name}
                  onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                  placeholder="Field name"
                  className="h-9"
                />
                <div className="flex gap-2">
                  <Select
                    value={field.type}
                    onValueChange={(value: CustomField["type"]) => handleUpdateField(index, { type: value, value: "" })}
                  >
                    <SelectTrigger className="h-9 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={String(field.value ?? "")}
                    onChange={(e) => handleUpdateField(index, {
                      value: field.type === "number" ? Number(e.target.value) :
                             field.type === "boolean" ? e.target.value === "true" :
                             e.target.value
                    })}
                    placeholder="Value"
                    className="h-9 flex-1"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDeleteField(index)}
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddField}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Fields
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
