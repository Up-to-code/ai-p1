import { Search, FileText, Folder, Users, ListTodo, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterTab = "all" | "documents" | "files" | "clients" | "tasks" | "calendar";

export const FILTER_TABS: {
  id: FilterTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all",       label: "All",       icon: Search   },
  { id: "documents", label: "Documents", icon: FileText  },
  { id: "files",     label: "Files",     icon: Folder    },
  { id: "clients",   label: "Clients",   icon: Users     },
  { id: "tasks",     label: "Tasks",     icon: ListTodo  },
  { id: "calendar",  label: "Calendar",  icon: Calendar  },
];

export function SearchFilterTabs({
  active,
  onChange,
}: {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-y border-border/30 px-3 py-1.5">
      {FILTER_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold transition-colors",
            active === id
              ? "bg-accent text-text-primary"
              : "text-text-muted hover:bg-accent/50 hover:text-text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
