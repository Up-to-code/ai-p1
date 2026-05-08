"use client";

import { useMemo, useState } from "react";
import { AppPageHeader, AppPageShell, AppPrimaryButton, AppStatsGrid, AppToolbar } from "@/components/shared";
import {
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type PipelineStage = "new" | "qualified" | "viewing" | "negotiation" | "closed";
type Priority = "normal" | "high" | "urgent";
type ViewMode = "pipeline" | "table" | "calendar";

interface Client {
  id: string;
  name: string;
  type: "Buyer" | "Tenant" | "Investor" | "Broker";
  contact: string;
  phone?: string;
  budget: string;
  propertyInterest: string;
  status: "active" | "inactive";
  added: string;
  pipelineStage: PipelineStage;
  priority: Priority;
  lastContact: string;
  nextAction: string;
  nextActionDate: Date;
  appointmentTime: string;
  syncState: "draft" | "eligible" | "synced" | "blocked" | "failed";
}

const MOCK_CLIENTS: Client[] = [
  {
    id: "cl-1", name: "Abdullah Al-Faisal", type: "Buyer", contact: "abdullah@example.com",
    phone: "+966 512 345 678", budget: "900K - 1.2M SAR", propertyInterest: "2BR apartment, Riyadh",
    status: "active", added: "May 1, 2026", pipelineStage: "qualified", priority: "high",
    lastContact: "Today", nextAction: "Send mortgage options", nextActionDate: new Date(2026, 4, 5),
    appointmentTime: "10:30", syncState: "eligible"
  },
  {
    id: "cl-2", name: "Sarah Al-Rashid", type: "Tenant", contact: "sarah@example.com",
    phone: "+966 555 123 456", budget: "80K - 110K SAR / year", propertyInterest: "Serviced apartment, Jeddah",
    status: "active", added: "May 2, 2026", pipelineStage: "new", priority: "normal",
    lastContact: "Yesterday", nextAction: "Confirm move-in date", nextActionDate: new Date(2026, 4, 6),
    appointmentTime: "13:00", syncState: "draft"
  },
  {
    id: "cl-3", name: "Capital Ventures", type: "Investor", contact: "info@capitalventures.sa",
    phone: "+966 11 234 5678", budget: "4M - 8M SAR", propertyInterest: "Commercial units, KAEC",
    status: "active", added: "April 28, 2026", pipelineStage: "negotiation", priority: "urgent",
    lastContact: "May 4", nextAction: "Share yield report", nextActionDate: new Date(2026, 4, 8),
    appointmentTime: "09:15", syncState: "synced"
  },
  {
    id: "cl-4", name: "Fahad Al-Saud", type: "Broker", contact: "fahad@example.com",
    phone: "+966 509 876 543", budget: "Partner pipeline", propertyInterest: "Waterfront villas, Dammam",
    status: "inactive", added: "April 15, 2026", pipelineStage: "viewing", priority: "normal",
    lastContact: "Apr 30", nextAction: "Review commission agreement", nextActionDate: new Date(2026, 4, 11),
    appointmentTime: "15:30", syncState: "draft"
  }
];

const pipelineColumns: { id: PipelineStage; labelKey: string }[] = [
  { id: "new", labelKey: "pipeline.new" },
  { id: "qualified", labelKey: "pipeline.qualified" },
  { id: "viewing", labelKey: "pipeline.viewing" },
  { id: "negotiation", labelKey: "pipeline.negotiation" },
  { id: "closed", labelKey: "pipeline.closed" },
];

export function ClientsWorkspace({ initialView = "pipeline" }: { initialView?: ViewMode }) {
  const t = useTranslations("Clients");
  const ta = useTranslations("ProjectDetails.actions");
  const router = useRouter();
  
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesType = typeFilter === "all" || client.type === typeFilter;
      const matchesSearch = !searchTerm || client.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [clients, typeFilter, searchTerm]);

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={t("eyebrow")}
        title={`${t("title")}.`}
        actions={
          <Link href="/clients/create">
            <AppPrimaryButton>
              <UserPlus className="me-2 h-3.5 w-3.5" />
              {t("register")}
            </AppPrimaryButton>
          </Link>
        }
      />

      <AppStatsGrid
        stats={[
          { label: t("stats.total"), value: clients.length, icon: Users },
          { label: t("stats.active"), value: clients.filter((client) => client.status === "active").length, dotClassName: "bg-emerald-500" },
          { label: t("stats.eligible"), value: clients.filter((client) => client.syncState === "synced" || client.syncState === "eligible").length, dotClassName: "bg-blue-500" },
          { label: t("stats.drafts"), value: clients.filter((client) => client.syncState === "draft").length, icon: Copy },
        ]}
      />

      <div className="space-y-6">
        <AppToolbar
          filters={[
            { value: "all", label: t("filters.all") },
            { value: "Buyer", label: "Buyer" },
            { value: "Tenant", label: "Tenant" },
            { value: "Investor", label: "Investor" },
            { value: "Broker", label: "Broker" },
          ]}
          activeFilter={typeFilter}
          onFilterChange={setTypeFilter}
          view={viewMode === "table" ? "list" : "grid"}
          onViewChange={(nextView) => setViewMode(nextView === "list" ? "table" : "pipeline")}
          sortLabel="Newest"
          trailing={
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-white/5 dark:bg-white/[0.02]">
              <Search className="h-3 w-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-32 border-none bg-transparent text-[9px] font-black uppercase tracking-widest text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
            </div>
          }
        />

        {/* Dynamic Workspace: Pipeline or Table */}
        <div className="pb-20">
          {viewMode === "pipeline" ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
              {pipelineColumns.map((column) => {
                const columnClients = filteredClients.filter((client) => client.pipelineStage === column.id);
                return (
                  <div 
                    key={column.id} 
                    className="flex flex-col gap-5"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const clientId = e.dataTransfer.getData("clientId") || draggedClientId;
                      if (clientId) {
                        setClients(prev => prev.map(c => c.id === clientId ? { ...c, pipelineStage: column.id } : c));
                      }
                      setDraggedClientId(null);
                    }}
                  >
                    <div className="flex items-center justify-between px-3">
                       <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                         <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-white/20" />
                         {t(column.labelKey)}
                       </h3>
                       <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 tracking-tighter">{columnClients.length.toString().padStart(2, '0')}</span>
                    </div>
                    <div className={cn(
                      "flex-1 min-h-[600px] p-3 bg-zinc-50/30 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 rounded-[32px] space-y-4 transition-all duration-300",
                      draggedClientId && "border-zinc-300 dark:border-white/10 bg-zinc-100/50 dark:bg-white/[0.02] ring-4 ring-zinc-900/5 dark:ring-white/5"
                    )}>
                       {columnClients.map((client) => (
                          <div 
                            key={client.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggedClientId(client.id);
                              e.dataTransfer.setData("clientId", client.id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDraggedClientId(null)}
                            className={cn(
                              "group bg-white dark:bg-[#0E0E0E] border border-zinc-100 dark:border-white/5 rounded-[24px] p-5 space-y-5 hover:border-zinc-900/10 dark:hover:border-white/20 transition-all cursor-grab active:cursor-grabbing shadow-none hover:shadow-none hover:shadow-zinc-900/5 dark:hover:shadow-none relative",
                              draggedClientId === client.id && "opacity-20 scale-95 border-dashed border-zinc-400 rotate-1"
                            )}
                          >
                             {/* Navigation Anchor */}
                             <button 
                               onClick={() => router.push(`/clients/${client.id}`)}
                               className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 z-10"
                             >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                             </button>

                             <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                   <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-transform group-hover:scale-105", 
                                     client.type === 'Buyer' ? "bg-violet-500/10 text-violet-500" :
                                     client.type === 'Tenant' ? "bg-blue-500/10 text-blue-500" :
                                     client.type === 'Investor' ? "bg-emerald-500/10 text-emerald-500" :
                                     "bg-amber-500/10 text-amber-500"
                                   )}>
                                      {client.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase leading-none tracking-tight">{client.name}</p>
                                      <div className="flex items-center gap-1.5 mt-1.5">
                                         <div className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-white/10" />
                                         <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.1em]">{client.type}</p>
                                      </div>
                                   </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                   <DropdownMenu>
                                      <DropdownMenuTrigger className="outline-none">
                                         <div className="h-7 w-7 rounded-xl flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                         </div>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0E0E0E] p-1.5 shadow-none">
                                         <DropdownMenuItem 
                                           onClick={() => router.push(`/clients/${client.id}`)}
                                           className="rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2 focus:bg-zinc-900 focus:text-white"
                                         >
                                            <Eye className="h-3 w-3" /> {ta('view')}
                                         </DropdownMenuItem>
                                         <DropdownMenuItem 
                                           onClick={() => router.push(`/clients/${client.id}/edit`)}
                                           className="rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2 focus:bg-zinc-900 focus:text-white"
                                         >
                                            <Edit className="h-3 w-3" /> {ta('edit')}
                                         </DropdownMenuItem>
                                         <DropdownMenuSeparator className="bg-zinc-50 dark:bg-white/5" />
                                         <DropdownMenuItem className="rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2 text-red-500 focus:bg-red-500 focus:text-white">
                                            <Trash2 className="h-3 w-3" /> {ta('delete')}
                                         </DropdownMenuItem>
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </div>
                             </div>
                             
                             <div className="space-y-3">
                                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase leading-relaxed tracking-tight line-clamp-2 min-h-[2.4em]">{client.propertyInterest}</p>
                                <div className="flex items-center gap-2">
                                   <CircleDollarSign className="h-3 w-3 text-zinc-200" />
                                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">{client.budget}</p>
                                </div>
                             </div>

                             <div className="pt-4 border-t border-zinc-50 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                     "h-1.5 w-1.5 rounded-full",
                                     client.priority === 'urgent' ? "bg-red-500 animate-pulse" : 
                                     client.priority === 'high' ? "bg-amber-500" : 
                                     "bg-zinc-300 dark:bg-white/10"
                                   )} />
                                   <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                      {t(`priority.${client.priority}`)}
                                   </span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-100 dark:border-white/5 group-hover:border-zinc-900/10 transition-colors">
                                   <Clock3 className="h-2.5 w-2.5 text-zinc-300" />
                                   <span className="text-[7px] font-black uppercase tracking-[0.1em] text-zinc-500">{client.lastContact}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                       
                       {columnClients.length === 0 && (
                         <div className="h-20 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[24px] flex items-center justify-center">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-800">Empty</span>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-zinc-100 dark:border-white/5 rounded-[24px] overflow-hidden bg-white dark:bg-[#0A0A0A]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Client Identity</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Requirement</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Contact</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Added</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-white/[0.02]">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id} 
                      onClick={() => router.push(`/clients/${client.id}`)}
                      className="group hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-transform group-hover:scale-105", 
                             client.type === 'Buyer' ? "bg-violet-500/10 text-violet-500" :
                             client.type === 'Tenant' ? "bg-blue-500/10 text-blue-500" :
                             client.type === 'Investor' ? "bg-emerald-500/10 text-emerald-500" :
                             "bg-amber-500/10 text-amber-500"
                           )}>
                              {client.name.charAt(0)}
                           </div>
                           <div>
                             <p className="text-xs font-black text-zinc-900 dark:text-white uppercase truncate max-w-[200px]">{client.name}</p>
                             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{client.type}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-tighter truncate max-w-[250px]">{client.propertyInterest}</p>
                        <p className="text-[9px] font-black text-zinc-400 uppercase mt-1">{client.budget}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={cn("h-1.5 w-1.5 rounded-full", client.status === 'active' ? "bg-emerald-500" : "bg-zinc-400")} />
                           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{client.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tight">{client.contact}</p>
                           <p className="text-[10px] font-black text-zinc-400 uppercase">{client.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase text-right">{client.added}</td>
                      <td className="px-6 py-4 text-right">
                         <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                               <DropdownMenuTrigger className="outline-none">
                                  <div className="h-8 w-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                                     <MoreHorizontal className="h-4 w-4" />
                                  </div>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0E0E0E] p-1.5 shadow-none">
                                  <DropdownMenuItem 
                                    onClick={() => router.push(`/clients/${client.id}`)}
                                    className="rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2 focus:bg-zinc-900 focus:text-white"
                                  >
                                     <Eye className="h-3.5 w-3.5" /> {ta('view')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => router.push(`/clients/${client.id}/edit`)}
                                    className="rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2 focus:bg-zinc-900 focus:text-white"
                                  >
                                     <Edit className="h-3.5 w-3.5" /> {ta('edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-zinc-50 dark:bg-white/5" />
                                  <DropdownMenuItem className="rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2 text-red-500 focus:bg-red-500 focus:text-white">
                                     <Trash2 className="h-3.5 w-3.5" /> {ta('delete')}
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppPageShell>
  );
}
