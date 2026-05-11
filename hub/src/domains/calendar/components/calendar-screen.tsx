"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, User, Clock, X, Eye } from "lucide-react";
import { AppPageHeader, AppPageShell, AppPrimaryButton, AppStatsGrid } from "@/components/shared";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCalendarStore } from "@/domains/calendar";
import type { CalendarEvent } from "../store/calendar.types";
import { calendarEventSchema, type CalendarEventFormValues } from "../validation/calendar.schema";
import { useAccountContext } from "@/domains/auth";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useClientTaskOptionsQuery } from "@/domains/clients/api/client-tasks";
import { usePropertyOptionsQuery } from "@/domains/properties/api/properties";
import { createCalendarEventRequest, deleteCalendarEventRequest, updateCalendarEventRequest, useCalendarEventsRangeQuery, useCalendarStatsRangeQuery } from "../api/calendar";
import { useOperationState } from "@/lib/utils/operation-state";
import { ChoiceGrid, DeleteRecordDialog, FormErrorSummary, ProgressiveLoadingState, StatusPill, TextInput, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type StatusPillTone = ComponentProps<typeof StatusPill>["tone"];

/* ── Helpers ── */
function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let i = firstDay.getDay() - 1; i >= 0; i--) { const d = new Date(firstDay); d.setDate(firstDay.getDate() - i - 1); days.push(d); }
  for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
  const lastDow = lastDay.getDay();
  for (let i = 1; i < 7 - lastDow; i++) { const d = new Date(lastDay); d.setDate(lastDay.getDate() + i); days.push(d); }
  return days;
}
function getWeekDays(date: Date): Date[] {
  const start = new Date(date); start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}
function toIso(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function generateTimeSlots() { const s: string[] = []; for (let h=8;h<=20;h++) for (let m=0;m<60;m+=30) s.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`); return s; }
function startOfDay(date: Date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d.getTime(); }
function endOfDay(date: Date) { const d = new Date(date); d.setHours(23, 59, 59, 999); return d.getTime(); }
function visibleRange(date: Date, view: "month" | "week" | "day") {
  if (view === "day") return { startAt: startOfDay(date), endAt: endOfDay(date) };
  const days = view === "week" ? getWeekDays(date) : getDaysInMonth(date);
  return { startAt: startOfDay(days[0]), endAt: endOfDay(days[days.length - 1]) };
}

function eventTone(status: CalendarEvent["status"]): StatusPillTone {
  return status === "confirmed" ? "success" : status === "pending" ? "warning" : "neutral";
}
function typeBg(type: string) {
  if (type === "client-visit") return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";
  if (type === "site-viewing") return "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300";
  if (type === "appointment") return "bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300";
  if (type === "signing") return "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300";
  if (type === "follow-up") return "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300";
  if (type === "handover") return "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300";
  if (type === "audit") return "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300";
  return "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-zinc-300";
}

/* ── Main ── */
export function CalendarScreen() {
  const t = useTranslations('Calendar');
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();
  const range = useMemo(() => visibleRange(currentDate, view), [currentDate, view]);
  const eventsQuery = useCalendarEventsRangeQuery(workspaceOrganizationId, range.startAt, range.endAt);
  const stats = useCalendarStatsRangeQuery(workspaceOrganizationId, range.startAt, range.endAt);
  const events = useMemo(() => (eventsQuery ?? []) as CalendarEvent[], [eventsQuery]);
  const clients = useClientOptionsQuery(workspaceOrganizationId) ?? [];
  const units = usePropertyOptionsQuery(workspaceOrganizationId) ?? [];
  const tasks = useClientTaskOptionsQuery(workspaceOrganizationId) ?? [];
  const isLoading = isWorkspaceReady && eventsQuery === undefined;
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);
  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const deleteOperation = useOperationState({ errorMessage: "Event delete failed." });

  const isoCurrent = toIso(currentDate);
  const dayEvents = useMemo(() => events.filter(e => e.date === isoCurrent), [events, isoCurrent]);
  
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const eventsForDate = (d: Date) => eventsByDate[toIso(d)] || [];

  const isInSlot = (eventTime: string, slotTime: string) => {
    const [eh, em] = eventTime.split(":").map(Number);
    const [sh, sm] = slotTime.split(":").map(Number);
    const eventMin = eh * 60 + em;
    const slotMin = sh * 60 + sm;
    return eventMin >= slotMin && eventMin < slotMin + 30;
  };

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const headerLabel = () => {
    if (view === "month") return currentDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
    if (view === "week") {
      const days = getWeekDays(currentDate);
      return `${days[0].toLocaleDateString(locale,{month:"short",day:"numeric"})} – ${days[6].toLocaleDateString(locale,{month:"short",day:"numeric",year:"numeric"})}`;
    }
    return currentDate.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const weekDayLabels = [
    t('weekDays.sun'), t('weekDays.mon'), t('weekDays.tue'), 
    t('weekDays.wed'), t('weekDays.thu'), t('weekDays.fri'), 
    t('weekDays.sat')
  ];

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={t('eyebrow')}
        title={t('title') + "."}
        actions={
          <CreateEventDialog
            organizationId={workspaceOrganizationId}
            clients={clients}
            units={units}
            tasks={tasks}
          />
        }
      />

      <AppStatsGrid stats={[
        { label: t('stats.events'), value: stats?.total ?? "...", icon: CalendarDays },
        { label: t('stats.confirmed'), value: stats?.confirmed ?? "...", dotClassName: "bg-emerald-500" },
        { label: t('stats.pending'), value: stats?.pending ?? "...", dotClassName: "bg-amber-500" },
        { label: t('stats.owners'), value: stats?.owners ?? "...", icon: User },
      ]} />

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} />
      ) : isLoading ? (
        <ProgressiveLoadingState />
      ) : (
        <>
      {/* Calendar Card */}
      <div className="rounded-[24px] border border-zinc-100 bg-white overflow-hidden dark:border-white/5 dark:bg-[#0A0A0A]">
        {/* Switcher */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">{headerLabel()}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all rtl:rotate-180"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white rounded-xl hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all">{t('today')}</button>
              <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all rtl:rotate-180"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex gap-1 bg-zinc-50 p-1 rounded-xl dark:bg-white/5">
            {(["month", "week", "day"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", view === v ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}>{t(v)}</button>
            ))}
          </div>
        </div>

        {/* ── Month View ── */}
        {view === "month" && (
          <>
            <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-white/5">
              {weekDayLabels.map(d => (<div key={d} className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-zinc-400">{d}</div>))}
            </div>
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((date, i) => {
                const dayEvents = eventsForDate(date);
                const isCurrent = date.getMonth() === currentDate.getMonth();
                const isToday = toIso(date) === toIso(new Date());
                return (
                  <div key={i} onClick={() => { setDrawerDate(date); }} className={cn("min-h-[110px] border-b border-e border-zinc-50 p-2 cursor-pointer transition-all hover:bg-zinc-50/50 dark:border-white/[0.03] dark:hover:bg-white/[0.02]", !isCurrent && "opacity-30")}>
                    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black", isToday ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400")}>{date.getDate()}</span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }} className={cn("truncate rounded-lg border px-1.5 py-0.5 text-[10px] font-bold cursor-pointer", typeBg(ev.type))}>
                          {ev.time} {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 text-center">+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Week View ── */}
        {view === "week" && (
          <div className="grid grid-cols-7 divide-x rtl:divide-x-reverse divide-zinc-50 dark:divide-white/[0.03]">
            {getWeekDays(currentDate).map((date, i) => {
              const dayEvents = eventsForDate(date);
              const isToday = toIso(date) === toIso(new Date());
              return (
                <div key={i} className="min-h-[500px]">
                  <div className={cn("text-center p-3 border-b border-zinc-50 dark:border-white/[0.03]", isToday && "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900")}>
                    <div className="text-[10px] font-black uppercase tracking-widest">{weekDayLabels[date.getDay()]}</div>
                    <div className="text-lg font-black mt-0.5">{date.getDate()}</div>
                  </div>
                  <div className="p-2 space-y-2">
                    {dayEvents.map(ev => (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)} className={cn("p-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]", typeBg(ev.type))}>
                        <p className="text-[10px] font-black uppercase tracking-widest">{ev.time}</p>
                        <p className="text-xs font-bold mt-1 truncate">{ev.title}</p>
                        <p className="text-[10px] mt-1 opacity-60 truncate">{ev.owner}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Day View ── */}
        {view === "day" && (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="space-y-1">
              {generateTimeSlots().map(time => {
                const slotEvents = dayEvents.filter(e => isInSlot(e.time, time));
                return (
                  <div key={time} className="flex gap-6 group">
                    <div className="w-20 shrink-0 text-end rtl:text-start pt-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-zinc-500 transition-colors">{time}</div>
                    <div className={cn("flex-1 border-t border-zinc-50 dark:border-white/[0.03] min-h-[40px]", slotEvents.length > 0 && "py-2 space-y-2")}>
                      {slotEvents.map(ev => (
                        <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-white hover:border-zinc-300 cursor-pointer transition-all dark:border-white/5 dark:bg-zinc-900 dark:hover:border-white/10">
                          <div>
                            <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">{ev.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><User className="h-3 w-3" />{ev.owner}</span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><Clock className="h-3 w-3" />{ev.time}</span>
                            </div>
                          </div>
                          <StatusPill label={t(`statuses.${ev.status}`)} tone={eventTone(ev.status)} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Day Drawer ── */}
      {drawerDate && (
        <DayDrawer
          date={drawerDate}
          events={eventsForDate(drawerDate)}
          onClose={() => setDrawerDate(null)}
          onEventClick={setSelectedEvent}
          onDelete={(id) => {
            if (!account.organization.id) return;
            void deleteCalendarEventRequest(account.organization.id, id);
          }}
        />
      )}

      {/* ── Event Detail ── */}
      {selectedEvent && (
        <EventDetailDrawer 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onDelete={(id) => {
            if (!account.organization.id) return;
            void deleteCalendarEventRequest(account.organization.id, id);
            setSelectedEvent(null);
          }}
          onEdit={(updated) => {
            if (!account.organization.id) return;
            void updateCalendarEventRequest(account.organization.id, selectedEvent.id, { ...selectedEvent, ...updated });
            setSelectedEvent(null);
          }}
          organizationId={workspaceOrganizationId}
          clients={clients}
          units={units}
          tasks={tasks}
        />
      )}

      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => { if (!open) { deleteOperation.clearError(); setDeleting(null); } }}
        title={t('delete.title')}
        description={t('delete.desc', { name: deleting?.title ?? "..." })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!deleting) throw new Error("No event");
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deleteCalendarEventRequest(account.organization.id, deleting.id);
        }, { successMessage: "Event deleted.", onSuccess: () => setDeleting(null) })}
      />
        </>
      )}
    </AppPageShell>
  );
}

/* ── Day Drawer ── */
function DayDrawer({ date, events, onClose, onEventClick, onDelete }: { date: Date; events: CalendarEvent[]; onClose: () => void; onEventClick: (e: CalendarEvent) => void; onDelete: (id: string) => void }) {
  const t = useTranslations('Calendar');
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 end-0 w-full max-w-md bg-white z-[101] overflow-y-auto dark:bg-[#0A0A0A] border-s border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-white/5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('drawer.title')}</p>
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-1">
              {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        <div className="p-5">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <CalendarDays className="h-8 w-8 text-zinc-300" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest">{t('drawer.noEvents')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.sort((a, b) => a.time.localeCompare(b.time)).map(ev => (
                <div key={ev.id} className="rounded-2xl border border-zinc-100 p-4 hover:border-zinc-300 cursor-pointer transition-all dark:border-white/5 dark:hover:border-white/10" onClick={() => { onClose(); onEventClick(ev); }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">{ev.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><Clock className="h-3 w-3" />{ev.time}</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><User className="h-3 w-3" />{ev.owner}</span>
                      </div>
                    </div>
                    <StatusPill label={t(`statuses.${ev.status}`)} tone={eventTone(ev.status)} />
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-50 dark:border-white/5">
                    <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", typeBg(ev.type))}>{t(`types.${ev.type}`)}</span>
                    <div className="flex-1" />
                    <button onClick={(e) => { e.stopPropagation(); onDelete(ev.id); }} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Event Detail Drawer ── */
function EventDetailDrawer({ 
  event, 
  onClose, 
  onDelete,
  onEdit,
  organizationId,
  clients,
  units,
  tasks,
}: { 
  event: CalendarEvent; 
  onClose: () => void; 
  onDelete: (id: string) => void;
  onEdit: (updated: Partial<CalendarEvent>) => void;
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  units: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
}) {
  const t = useTranslations('Calendar');
  const eventDate = new Date(event.date + "T00:00:00");
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 end-0 w-full max-w-md bg-white z-[101] overflow-y-auto dark:bg-[#0A0A0A] border-s border-zinc-100 dark:border-white/5">
        <div className="p-5 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('detail.eyebrow')}</p>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"><X className="h-5 w-5 text-zinc-400" /></button>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-3">{event.title}</h2>
          <div className="flex items-center gap-2 mt-3">
            <StatusPill label={t(`statuses.${event.status}`)} tone={eventTone(event.status)} />
            <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", typeBg(event.type))}>{t(`types.${event.type}`)}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5"><User className="h-4 w-4 text-zinc-400" /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('detail.owner')}</p>
              <p className="text-sm font-black uppercase text-zinc-900 dark:text-white mt-0.5">{event.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5"><CalendarDays className="h-4 w-4 text-zinc-400" /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('detail.date')}</p>
              <p className="text-sm font-black uppercase text-zinc-900 dark:text-white mt-0.5">{eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5"><Clock className="h-4 w-4 text-zinc-400" /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('detail.time')}</p>
              <p className="text-sm font-black uppercase text-zinc-900 dark:text-white mt-0.5">{event.time}</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-zinc-100 dark:border-white/5 space-y-3">
          <EditEventDialog event={event} onSave={onEdit} organizationId={organizationId} clients={clients} units={units} tasks={tasks} />
          <button onClick={() => onDelete(event.id)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
            {t('delete.title')}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Create Event Dialog ── */
function CreateEventDialog({
  organizationId,
  clients,
  units,
  tasks,
}: {
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  units: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
}) {
  const t = useTranslations('Calendar');
  const [open, setOpen] = useState(false);
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const defaultValues: CalendarEventFormValues = { title: "", owner: "", date: defaultDate, time: "10:00", type: "follow-up", status: "draft", clientId: "", unitId: "", taskId: "", location: "", notes: "" };
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues,
  });
  const form = useWatch({ control }) as CalendarEventFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof CalendarEventFormValues, string | undefined>;
  const createOperation = useOperationState({ errorMessage: "Event creation failed." });

  function updateField<TKey extends keyof CalendarEventFormValues>(key: TKey, value: CalendarEventFormValues[TKey]) {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    createOperation.clearError();
  }
  const onSubmit = handleSubmit((data) => {
    void createOperation.run(() => {
      if (!organizationId) throw new Error("Select an organization first.");
      return createCalendarEventRequest(organizationId, data);
    }, { successMessage: "Event created.", onSuccess: () => { setOpen(false); reset(defaultValues); } });
  });

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { reset(defaultValues); createOperation.clearError(); } }}>
      <DialogTrigger render={<AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{t('add')}</AppPrimaryButton>} />
      <DialogContent className="max-w-md rounded-[32px] border-zinc-100 bg-white p-8 shadow-none dark:border-white/5 dark:bg-[#0A0A0A]">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('form.title')}</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <FormErrorSummary errors={fieldErrors} />
          <TextInput label={t('form.titleLabel')} name="title" value={form.title} onChange={v => updateField("title", v)} error={fieldErrors.title} />
          <TextInput label={t('form.ownerLabel')} name="owner" value={form.owner} onChange={v => updateField("owner", v)} error={fieldErrors.owner} />
          <select value={form.clientId ?? ""} onChange={(event) => updateField("clientId", event.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
            <option value="">Client context</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
          <select value={form.unitId ?? ""} onChange={(event) => updateField("unitId", event.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
            <option value="">Unit context</option>
            {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
          </select>
          <select value={form.taskId ?? ""} onChange={(event) => updateField("taskId", event.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
            <option value="">Task context</option>
            {tasks
              .filter((task) => !form.clientId || task.clientId === form.clientId)
              .map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
          <TextInput label={t('form.dateLabel')} name="date" type="date" value={form.date} onChange={v => updateField("date", v)} error={fieldErrors.date} />
          <TextInput label={t('form.timeLabel')} name="time" type="time" value={form.time} onChange={v => updateField("time", v)} error={fieldErrors.time} />
          <ChoiceGrid id="event-type" label={t('form.typeLabel')} value={form.type} onChange={v => updateField("type", v as CalendarEventFormValues["type"])} columns="grid-cols-2 md:grid-cols-4" error={fieldErrors.type}
            options={[
              { value: "client-visit", label: t('types.client-visit') },
              { value: "site-viewing", label: t('types.site-viewing') },
              { value: "appointment", label: t('types.appointment') },
              { value: "signing", label: t('types.signing') },
              { value: "follow-up", label: t('types.follow-up') },
              { value: "handover", label: t('types.handover') },
              { value: "audit", label: t('types.audit') },
              { value: "custom", label: t('types.custom') },
            ]}
          />
        </div>
        <DialogFooter>
          <AppPrimaryButton disabled={createOperation.isRunning || isSubmitting} onClick={onSubmit}>{t('form.createBtn')}</AppPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Edit Event Dialog ── */
function EditEventDialog({
  event,
  onSave,
  clients,
  units,
  tasks,
}: {
  event: CalendarEvent;
  onSave: (input: Partial<CalendarEvent>) => void;
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  units: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
}) {
  const t = useTranslations('Calendar');
  const [open, setOpen] = useState(false);
  const defaultValues: CalendarEventFormValues = { 
    title: event.title, 
    owner: event.owner, 
    date: event.date, 
    time: event.time, 
    type: event.type, 
    status: event.status,
    clientId: event.clientId ?? "",
    unitId: event.unitId ?? event.propertyId ?? "",
    taskId: event.taskId ?? "",
    location: event.location ?? "",
    notes: event.notes ?? "",
  };
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues,
  });
  const form = useWatch({ control }) as CalendarEventFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof CalendarEventFormValues, string | undefined>;
  const updateOperation = useOperationState({ errorMessage: "Event update failed." });

  function updateField<TKey extends keyof CalendarEventFormValues>(key: TKey, value: CalendarEventFormValues[TKey]) {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    updateOperation.clearError();
  }
  const onSubmit = handleSubmit((data) => {
    updateOperation.run(() => onSave(data), { successMessage: "Event updated.", onSuccess: () => { setOpen(false); } });
  });

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { reset(defaultValues); updateOperation.clearError(); } }}>
      <DialogTrigger render={<Button variant="outline" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-100 dark:border-white/10"><Eye className="me-2 h-3.5 w-3.5" />{t('detail.edit') || "Edit"}</Button>} />
      <DialogContent className="max-w-md rounded-[32px] border-zinc-100 bg-white p-8 shadow-none dark:border-white/5 dark:bg-[#0A0A0A]">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('form.title')}</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <FormErrorSummary errors={fieldErrors} />
          <TextInput label={t('form.titleLabel')} name="title" value={form.title} onChange={v => updateField("title", v)} error={fieldErrors.title} />
          <TextInput label={t('form.ownerLabel')} name="owner" value={form.owner} onChange={v => updateField("owner", v)} error={fieldErrors.owner} />
          <select value={form.clientId ?? ""} onChange={(event) => updateField("clientId", event.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
            <option value="">Client context</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
          <select value={form.unitId ?? ""} onChange={(event) => updateField("unitId", event.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
            <option value="">Unit context</option>
            {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
          </select>
          <select value={form.taskId ?? ""} onChange={(event) => updateField("taskId", event.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
            <option value="">Task context</option>
            {tasks
              .filter((task) => !form.clientId || task.clientId === form.clientId)
              .map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
          <TextInput label={t('form.dateLabel')} name="date" type="date" value={form.date} onChange={v => updateField("date", v)} error={fieldErrors.date} />
          <TextInput label={t('form.timeLabel')} name="time" type="time" value={form.time} onChange={v => updateField("time", v)} error={fieldErrors.time} />
          <ChoiceGrid id="edit-event-type" label={t('form.typeLabel')} value={form.type} onChange={v => updateField("type", v as CalendarEventFormValues["type"])} columns="grid-cols-2 md:grid-cols-4" error={fieldErrors.type}
            options={[
              { value: "client-visit", label: t('types.client-visit') },
              { value: "site-viewing", label: t('types.site-viewing') },
              { value: "appointment", label: t('types.appointment') },
              { value: "signing", label: t('types.signing') },
              { value: "follow-up", label: t('types.follow-up') },
              { value: "handover", label: t('types.handover') },
              { value: "audit", label: t('types.audit') },
              { value: "custom", label: t('types.custom') },
            ]}
          />
          <ChoiceGrid id="edit-event-status" label={t('statuses.title') || "Status"} value={form.status} onChange={v => updateField("status", v as CalendarEventFormValues["status"])} columns="grid-cols-3" error={fieldErrors.status}
            options={[
              { value: "draft", label: t('statuses.draft') },
              { value: "pending", label: t('statuses.pending') },
              { value: "confirmed", label: t('statuses.confirmed') },
            ]}
          />
        </div>
        <DialogFooter>
          <AppPrimaryButton disabled={updateOperation.isRunning || isSubmitting} onClick={onSubmit}>{t('save') || "Save"}</AppPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
