"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Filter, Settings, Phone, ListTodo, CheckCircle2, Search, Plus } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", color: "#6b7280", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#6b7280" strokeWidth="1.5"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg> },
  { id: "list", label: "List", color: "#6b7280", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#6b7280" strokeWidth="1.5"><line x1="3" y1="4" x2="11" y2="4"/><line x1="3" y1="7" x2="11" y2="7"/><line x1="3" y1="10" x2="11" y2="10"/></svg> },
  { id: "gantt", label: "Gantt", color: "#ef4444", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#ef4444" strokeWidth="1.5"><line x1="2" y1="4" x2="9" y2="4"/><line x1="5" y1="7" x2="12" y2="7"/><line x1="2" y1="10" x2="7" y2="10"/></svg> },
  { id: "calendar", label: "Calendar", color: "#f97316", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#f97316" strokeWidth="1.5"><rect x="1" y="2" width="12" height="11" rx="1.5"/><line x1="1" y1="5.5" x2="13" y2="5.5"/><line x1="4" y1="1" x2="4" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/></svg> },
  { id: "table", label: "Table", color: "#22c55e", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="1.5"><rect x="1" y="1" width="12" height="12" rx="1"/><line x1="1" y1="5" x2="13" y2="5"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="5" y1="1" x2="5" y2="13"/></svg> },
  { id: "board", label: "Board", color: "#a855f7", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#a855f7" strokeWidth="1.5"><rect x="1" y="1" width="3" height="12" rx="1"/><rect x="5.5" y="1" width="3" height="8" rx="1"/><rect x="10" y="1" width="3" height="10" rx="1"/></svg> },
];

interface WorkspaceTabSwitcherProps {
  activeTab: string;
  onChangeTab: (tabId: string) => void;
}

export function WorkspaceTabSwitcher({ activeTab, onChangeTab }: WorkspaceTabSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-transparent flex flex-col">
      <div className="px-4">
        <div className="flex items-end gap-[1px] relative pt-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                style={isActive ? { color: tab.color } : {}}
                className={cn(
                  "flex items-center gap-[5px] px-[10px] pt-[6px] pb-[8px] text-[12px] cursor-pointer whitespace-nowrap rounded-t-[6px] select-none transition-colors",
                  isActive
                    ? "font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {tab.icon}
                {tab.label}
              </div>
            );
          })}

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "text-[12px] px-[8px] pt-[6px] pb-[8px] cursor-pointer rounded-t-[6px] select-none whitespace-nowrap transition-colors",
                dropdownOpen ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              + View
            </div>

            {dropdownOpen && (
              <div className="absolute top-[4px] left-[0px] md:left-[-320px] bg-[#13131f] border border-[#1e2240] rounded-[10px] w-[440px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-[100]">
                <div className="flex items-center gap-[8px] px-[14px] py-[10px] border-b border-[#1a1a2e]">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#4b5563" strokeWidth="1.5"><circle cx="6" cy="6" r="4"/><line x1="9.5" y1="9.5" x2="13" y2="13"/></svg>
                  <input
                    type="text"
                    placeholder="Search views..."
                    className="bg-transparent border-none outline-none text-[#e5e7eb] text-[13px] flex-1 placeholder:text-[#4b5563]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="py-[6px] max-h-[440px] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#1e2240] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
                  <div className="text-[11px] font-medium text-[#4b5563] px-[14px] pt-[8px] pb-[4px] tracking-[0.03em]">Popular</div>
                  <div className="grid grid-cols-2 gap-[1px] px-[6px] pb-[4px]">
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors" onClick={() => { onChangeTab("list"); setDropdownOpen(false); }}>
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#059669]">☰</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">List</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Track tasks, bugs, people & more</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors" onClick={() => { onChangeTab("gantt"); setDropdownOpen(false); }}>
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[13px] text-white font-bold bg-[#dc2626]">Gnt</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Gantt</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Plan dependencies & time</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors" onClick={() => { onChangeTab("calendar"); setDropdownOpen(false); }}>
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#ea580c]">📅</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Calendar</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Plan, schedule, & delegate</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors" onClick={() => { onChangeTab("board"); setDropdownOpen(false); }}>
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#7c3aed]">⬛</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Board – Kanban</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Move tasks between columns</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors">
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#1d4ed8]">📄</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Doc</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Collaborate & document anything</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors">
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#db2777]">📋</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Form</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Collect, track, & report data</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors" onClick={() => { onChangeTab("overview"); setDropdownOpen(false); }}>
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#d97706]">📊</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Dashboard</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Track metrics & insights</div></div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#1a1a2e] my-[4px] mx-[14px]"></div>

                  <div className="text-[11px] font-medium text-[#4b5563] px-[14px] pt-[8px] pb-[4px] tracking-[0.03em]">More views</div>
                  <div className="grid grid-cols-2 gap-[1px] px-[6px] pb-[4px]">
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors" onClick={() => { onChangeTab("table"); setDropdownOpen(false); }}>
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#16a34a]">⊞</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Table</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Structured table format</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors">
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#ca8a04]">✏️</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Whiteboard</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Visualize & brainstorm ideas</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors">
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#ea580c]">⟶</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Timeline</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">See tasks by start & due date</div></div>
                    </div>
                    <div className="flex items-center gap-[10px] p-[9px_10px] rounded-[7px] cursor-pointer hover:bg-[#1a1a2e] transition-colors">
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 text-[16px] bg-[#0891b2]">⚡</div>
                      <div><div className="text-[13px] font-medium text-[#d1d5db]">Activity</div><div className="text-[11px] text-[#4b5563] mt-[1px] leading-[1.3]">Real-time activity feed</div></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-[16px] px-[14px] py-[9px] border-t border-[#1a1a2e]">
                  <label className="flex items-center gap-[6px] text-[12px] text-[#6b7280] cursor-pointer">
                    <input type="checkbox" className="accent-[#2563eb] w-[13px] h-[13px]" /> 🔒 Private view
                  </label>
                  <label className="flex items-center gap-[6px] text-[12px] text-[#6b7280] cursor-pointer">
                    <input type="checkbox" className="accent-[#2563eb] w-[13px] h-[13px]" /> 📌 Pin view
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-[6px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <div className="hover:text-foreground cursor-pointer transition-colors p-1.5 rounded-md hover:bg-accent/50">
            <Phone className="w-[15px] h-[15px]" />
          </div>
          <div className="hover:text-foreground cursor-pointer transition-colors p-1.5 rounded-md hover:bg-accent/50">
            <ListTodo className="w-[15px] h-[15px]" />
          </div>
        </div>

        <div className="flex items-center gap-[6px]">
          <div className="hover:bg-accent hover:text-foreground text-muted-foreground cursor-pointer transition-colors p-1.5 rounded-md">
            <Filter className="w-[14px] h-[14px]" />
          </div>
          <div className="hover:bg-accent hover:text-foreground text-muted-foreground cursor-pointer transition-colors p-1.5 rounded-md">
            <CheckCircle2 className="w-[14px] h-[14px]" />
          </div>
          <div className="flex items-center gap-1.5 hover:bg-accent hover:text-foreground text-muted-foreground cursor-pointer transition-colors px-2 py-1.5 rounded-md mx-1">
            <Search className="w-[14px] h-[14px]" />
            <span className="text-[12px] font-medium opacity-80">Search</span>
          </div>
          <div className="hover:bg-accent hover:text-foreground text-muted-foreground cursor-pointer transition-colors p-1.5 rounded-md">
            <Settings className="w-[14px] h-[14px]" />
          </div>
          <div className="ml-2">
            <button className="flex items-center gap-1 bg-white text-black hover:bg-white/90 px-3 py-[5px] rounded-[6px] text-[12px] font-semibold transition-colors shadow-sm">
              <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
              Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
