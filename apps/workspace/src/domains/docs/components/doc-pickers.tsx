"use client";

import { Globe, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocVisibility } from "../docs.types";

const VISIBILITY_OPTIONS = [
  { value: "private" as const, label: "Private", icon: Lock },
  { value: "team" as const, label: "Team", icon: Users },
  { value: "workspace" as const, label: "Workspace", icon: Globe },
];

export function VisibilityPicker({
  value,
  onChange,
}: {
  value: DocVisibility;
  onChange: (v: DocVisibility) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DocVisibility)}
      className="h-6 rounded-lg border border-border bg-card px-2 text-[11px] font-medium text-foreground outline-none"
    >
      {VISIBILITY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
