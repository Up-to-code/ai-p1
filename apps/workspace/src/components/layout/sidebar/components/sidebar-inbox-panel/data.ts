import { FolderOpen, Hash, Users } from "lucide-react";
import type { IconOption, OrgFilterType } from "./types";

export const iconOptions: IconOption[] = [
  { id: "hash", icon: Hash, label: "Hash" },
  { id: "users", icon: Users, label: "Users" },
  { id: "folder", icon: FolderOpen, label: "Folder" },
];

export const orgFilterOptions: { id: OrgFilterType; label: string }[] = [
  { id: "all", label: "All channels" },
  { id: "organization", label: "Organization" },
  { id: "space", label: "Space" },
  { id: "project", label: "Project" },
];
