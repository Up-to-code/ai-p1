"use client";

import { Folder, Settings2, Calendar, Flag, UserPlus, MoreHorizontal, Plus } from "lucide-react";
import { ProgressBar } from "@qentrah/our-platform-components";
import { cn } from "@/lib/utils";

const mockTableData = [
  { id: 1, type: "folder", name: "Fity", sub: "Team Space", color: "-", progress: 3, total: 12, done: 3, due: 8, start: "-", end: "-", priority: "-", owner: "-" },
  { id: 2, type: "list", name: "List", sub: "Team Space > Fity", color: "-", progress: 3, total: 12, done: 3, due: 8, start: "icon", end: "icon", priority: "icon", owner: "icon" },
  { id: 3, type: "list", name: "tewst", sub: "Team Space > Fity", color: "-", progress: 0, total: 0, done: 0, due: 0, start: "icon", end: "Jul 5", priority: "icon", owner: "icon" },
];

export function PortfolioTableWidget() {
  return (
    <div className="overflow-auto h-full pb-4">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="text-muted-foreground border-b border-border/30">
          <tr>
            <th className="font-medium pb-3 px-4 w-[280px]">Name</th>
            <th className="font-medium pb-3 px-4">Color</th>
            <th className="font-medium pb-3 px-4 w-48">Progress</th>
            <th className="font-medium pb-3 px-4 text-center">Done</th>
            <th className="font-medium pb-3 px-4 text-center">Due</th>
            <th className="font-medium pb-3 px-4">Start</th>
            <th className="font-medium pb-3 px-4">End</th>
            <th className="font-medium pb-3 px-4 text-center">Priority</th>
            <th className="font-medium pb-3 px-4 text-center">Owner</th>
            <th className="font-medium pb-3 px-4 text-center w-10">
              <Plus className="h-4 w-4 mx-auto cursor-pointer hover:text-foreground" />
            </th>
          </tr>
        </thead>
        <tbody>
          {mockTableData.map((row) => (
            <tr key={row.id} className="border-b border-border/10 hover:bg-muted/30 transition-colors group">
              <td className="py-3 px-4">
                <div className="flex items-start gap-3">
                  {row.type === "folder" ? (
                    <Folder className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  ) : (
                    <Settings2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-2 text-[13px]">
                      {row.name}
                      {row.type === "folder" && <span className="text-muted-foreground text-xs">🔒</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{row.sub}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground text-[13px]">{row.color}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <ProgressBar
                    value={row.total > 0 ? (row.progress / row.total) * 100 : 0}
                    size="md"
                    className="w-24"
                    fillClassName="bg-indigo-500"
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {row.progress}/{row.total}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className={cn("text-xs font-bold", row.done > 0 ? "text-emerald-500" : "text-muted-foreground")}>
                  {row.done}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className={cn("text-xs font-bold", row.due > 0 ? "text-red-500" : "text-muted-foreground")}>
                  {row.due}
                </span>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {row.start === "icon" ? <Calendar className="h-3.5 w-3.5" /> : <span className="text-xs">{row.start}</span>}
              </td>
              <td className="py-3 px-4 text-foreground font-medium">
                {row.end === "icon" ? <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> : <span className="text-xs">{row.end}</span>}
              </td>
              <td className="py-3 px-4 text-center">
                {row.priority === "icon" ? <Flag className="h-3.5 w-3.5 mx-auto text-muted-foreground" /> : <span className="text-muted-foreground text-xs">{row.priority}</span>}
              </td>
              <td className="py-3 px-4 text-center">
                {row.owner === "icon" ? <UserPlus className="h-3.5 w-3.5 mx-auto text-muted-foreground" /> : <span className="text-muted-foreground text-xs">{row.owner}</span>}
              </td>
              <td className="py-3 px-4 text-center">
                <MoreHorizontal className="h-4 w-4 mx-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
