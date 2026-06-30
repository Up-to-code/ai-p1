import { Clock, BarChart3 } from "lucide-react";

export function WorkspaceActionsBar() {
  return (
    <div className="flex items-center justify-between px-6 py-2 border-t">
      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Refreshed: 13 mins ago
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          Auto refresh: On
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <BarChart3 className="w-3.5 h-3.5" />
          Schedule report
        </div>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <button className="hover:text-foreground transition-colors p-1">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="hover:text-foreground transition-colors p-1">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M8 2v12m-6-6h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="flex items-center gap-1 bg-foreground text-background hover:bg-foreground/90 px-3 py-1.5 rounded-md text-xs font-semibold ml-2">
          <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M6 2v8m-4-4h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Card
        </button>
      </div>
    </div>
  );
}
