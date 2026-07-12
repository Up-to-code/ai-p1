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
    <div className="border-b border-border/60">
      <div className="flex items-center gap-4 px-3 pt-1.5">
        {FILTER_TABS.slice(0, 4).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-0.5 py-2 text-[11px] font-medium transition-colors",
              active === id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2">
        {FILTER_TABS.slice(4).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors",
              active === id
                ? "border-foreground/25 bg-[var(--q-sidebar-accent)] text-foreground"
                : "border-border text-muted-foreground hover:bg-[var(--q-sidebar)] hover:text-foreground",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">Filter results</span>
      </div>
    </div>
  );
}
