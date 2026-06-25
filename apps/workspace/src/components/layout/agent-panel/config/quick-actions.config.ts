import {
  BarChart3,
  Clock,
  Edit3,
  FlaskConical,
  ListChecks,
  PenLine,
  Search,
} from "lucide-react";

export const agentQuickActions = [
  { label: "Find", icon: Search },
  { label: "Research", icon: FlaskConical },
  { label: "Create", icon: PenLine },
  { label: "Edit", icon: Edit3 },
  { label: "Analyze", icon: BarChart3 },
  { label: "Prioritize", icon: ListChecks },
  { label: "Schedule", icon: Clock },
] as const;
