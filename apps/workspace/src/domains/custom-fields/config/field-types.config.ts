import type { CustomFieldDefinition } from "../api/custom-fields";
import {
  Calendar,
  DollarSign,
  FileText,
  Hash,
  Link2,
  Tag,
  ToggleLeft,
  User,
  type LucideIcon,
} from "lucide-react";

export const CUSTOM_FIELD_TYPES: Array<{
  value: CustomFieldDefinition["type"];
  label: string;
  icon: LucideIcon;
}> = [
  { value: "text", label: "Text", icon: FileText },
  { value: "longText", label: "Long Text", icon: FileText },
  { value: "number", label: "Number", icon: Hash },
  { value: "currency", label: "Currency", icon: DollarSign },
  { value: "date", label: "Date", icon: Calendar },
  { value: "dateTime", label: "Date & Time", icon: Calendar },
  { value: "select", label: "Select", icon: Tag },
  { value: "multiSelect", label: "Multi-Select", icon: Tag },
  { value: "boolean", label: "Checkbox", icon: ToggleLeft },
  { value: "url", label: "URL", icon: Link2 },
  { value: "user", label: "Person / User", icon: User },
];

export const CUSTOM_FIELD_RECORD_TYPES = [
  { value: "client", label: "Clients" },
  { value: "project", label: "Projects" },
  { value: "deal", label: "Deals" },
  { value: "opportunity", label: "Opportunities" },
  { value: "task", label: "Tasks" },
  { value: "calendarEvent", label: "Calendar Events" },
] as const;
