"use client";

import { Check, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  "IN PROGRESS": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "PENDING": "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "READY FOR DEV": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "REVIEW": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "ISSUES FOUND": "bg-red-500/10 text-red-600 dark:text-red-400",
};

const mockTasks = [
  { id: 1, name: "Update contractor agreement", status: "IN PROGRESS", dueDate: "Tomorrow", timeRemaining: "6h 20m", note: "Planning" },
  { id: 2, name: "Plan for next year", status: "PENDING", dueDate: "-", timeRemaining: "-", note: "-" },
  { id: 3, name: "How to manage event planning", status: "READY FOR DEV", dueDate: "Apr 28", timeRemaining: "-", note: "-" },
  { id: 4, name: "Reminders for Tasks", status: "REVIEW", dueDate: "-", timeRemaining: "2h", note: "Execution" },
  { id: 5, name: "Budget assessment", status: "ISSUES FOUND", dueDate: "-", timeRemaining: "-", note: "-" },
  { id: 6, name: "Finalize project scope", status: "IN PROGRESS", dueDate: "Today", timeRemaining: "1h", note: "-" },
  { id: 7, name: "Gather key resources", status: "READY FOR DEV", dueDate: "-", timeRemaining: "-", note: "-" },
];

export function TaskTableWidget() {
  return (
    <div className="overflow-x-auto h-full pb-4">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-muted/50 dark:bg-white/[0.02]">
          <tr className="border-b border-border dark:border-white/5">
            <th className="w-12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">#</th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                Task
              </div>
            </th>
            <th className="w-40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Status</th>
            <th className="w-32 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Due Date</th>
            <th className="w-36 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Time Remaining</th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Note</th>
          </tr>
        </thead>
        <tbody>
          {mockTasks.map((task) => (
            <tr key={task.id} className="border-b border-border/70 last:border-0 transition-colors hover:bg-muted/30 dark:border-white/5 dark:hover:bg-white/[0.02] group">
              <td className="w-12 px-4 py-3 text-center text-muted-foreground">{task.id}</td>
              <td className="px-4 py-3 text-foreground font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-sm border border-muted-foreground/30 bg-transparent flex items-center justify-center group-hover:border-muted-foreground/50 transition-colors cursor-pointer" />
                  {task.name}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", statusTone[task.status])}>
                  {task.status}
                </span>
              </td>
              <td className={cn("px-4 py-3", task.dueDate === "Today" || task.dueDate === "Apr 28" ? "text-orange-500 font-medium" : "text-muted-foreground")}>
                {task.dueDate}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{task.timeRemaining}</td>
              <td className="px-4 py-3 text-muted-foreground flex justify-between items-center group/note">
                <span>{task.note}</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer mr-2" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
