import fs from 'fs';
import path from 'path';

const file = path.resolve('src/domains/calendar/components/calendar-screen.tsx');
let content = fs.readFileSync(file, 'utf-8');

// 1. Fix Imports
content = content.replace(/import \{ useClientOptionsQuery, useClientQuery, useClientAssetLinksQuery \} from "@\/domains\/clients\/api\/clients";/g, 'import { useClientOptionsQuery, useClientQuery } from "@/domains/clients/api/clients";');
content = content.replace(/import \{ useAssetOptionsQuery, useAssetQuery \} from "@\/domains\/assets\/api\/assets";\n/g, '');

// 2. Add Big Calendar imports
const bcImports = `import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import arSA from 'date-fns/locale/ar-SA';

const locales = {
  'en': enUS,
  'ar': arSA,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
`;
if (!content.includes("react-big-calendar")) {
  content = content.replace(/import \{ useAccountContext \}/, bcImports + '\nimport { useAccountContext }');
}

// 3. Remove assets hooks
content = content.replace(/const assetsQuery = useAssetOptionsQuery\(workspaceOrganizationId, \{ enabled: shouldLoadPickerOptions \}\);\n/g, '');
content = content.replace(/const assets = assetsQuery\?\.data \?\? \[\];\n/g, '');
// For any usage of useAssetQuery in children components
content = content.replace(/const asset = useAssetQuery[^\n]*\n/g, '');

// 4. Update BusinessScheduleDialog to not require assets
content = content.replace(/assets=\{assets\}\n\s*tasks=\{tasks\}\n\s*clientsLoading=\{isContextLoading && !clientsQuery\}\n\s*assetsLoading=\{isContextLoading && !assetsQuery\}/g, 'tasks={tasks}\n            clientsLoading={isContextLoading && !clientsQuery}');

// 5. Replace UntitledCalendarSurface call with BigCalendarSurface
const surfaceCallRegex = /<UntitledCalendarSurface[\s\S]*?weekDayLabels=\{getCalendarWeekDays\(currentDate, locale\)\}\n\s*\/>/;
const newSurfaceCall = `<BigCalendarSurface
            currentDate={currentDate}
            events={visibleEvents}
            locale={locale}
            onDateClick={(date) => {
              setInitialDate(date);
              setIsCreateOpen(true);
            }}
            onEventClick={setEditingEvent}
            onNavigate={(dir) => setCurrentDate(nextCalendarDate(currentDate, view, dir))}
            onToday={() => setCurrentDate(new Date())}
            onViewChange={setView}
            view={view}
          />`;
content = content.replace(surfaceCallRegex, newSurfaceCall);

// 6. Append BigCalendarSurface implementation to the end of the file
const bigCalendarImpl = `
function BigCalendarSurface({
  currentDate,
  events,
  locale,
  onDateClick,
  onEventClick,
  onNavigate,
  onToday,
  onViewChange,
  view,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  locale: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onNavigate: (direction: 1 | -1) => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  view: CalendarView;
}) {
  const mappedEvents = events.map(e => ({
    ...e,
    start: new Date(e.startAt),
    end: new Date(e.endAt),
  }));

  const viewMap: Record<CalendarView, any> = {
    month: 'month',
    week: 'week',
    day: 'day',
  };

  return (
    <section className="h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white text-zinc-950 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={viewMap[view]}
        culture={locale === 'ar' ? 'ar' : 'en'}
        onNavigate={(newDate) => {
           // We'll use our custom toolbar
        }}
        onView={() => {}}
        onSelectEvent={(e) => onEventClick(e as any)}
        onSelectSlot={(slotInfo) => onDateClick(slotInfo.start)}
        selectable
        components={{
          event: ({ event }) => (
            <CalendarEventChip
              event={event as any}
              onClick={() => onEventClick(event as any)}
              variant="compact"
            />
          ),
          toolbar: (toolbarProps) => {
            const { onNavigate: rbcNavigate, onView: rbcView, label, view: currentView } = toolbarProps;
            return (
              <div className="flex flex-col gap-5 border-b border-zinc-100 p-4 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between lg:p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-center dark:border-white/10 dark:bg-white/[0.03] sm:flex">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {calendarShortMonthLabel(currentDate, locale)}
                    </span>
                    <span className="text-xl font-black leading-none text-zinc-950 dark:text-white">
                      {currentDate.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black uppercase tracking-normal text-zinc-950 dark:text-white">
                      {label}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                  <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-white/[0.03]">
                    <AriaButton
                      aria-label="Previous calendar period"
                      onPress={() => { rbcNavigate('PREV'); onNavigate(-1); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white rtl:rotate-180"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </AriaButton>
                    <AriaButton
                      onPress={() => { rbcNavigate('TODAY'); onToday(); }}
                      className="h-8 rounded-lg bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      Today
                    </AriaButton>
                    <AriaButton
                      aria-label="Next calendar period"
                      onPress={() => { rbcNavigate('NEXT'); onNavigate(1); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white rtl:rotate-180"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </AriaButton>
                  </div>

                  <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-white/[0.03] sm:w-auto">
                    {(["month", "week", "day"] as const).map((nextView) => (
                      <AriaButton
                        key={nextView}
                        onPress={() => { rbcView(nextView); onViewChange(nextView); }}
                        className={cn(
                          "h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                          currentView === nextView
                            ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                            : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white",
                        )}
                      >
                        {nextView}
                      </AriaButton>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
        }}
      />
    </section>
  );
}
`;

if (!content.includes('function BigCalendarSurface')) {
  content += '\n' + bigCalendarImpl;
}

fs.writeFileSync(file, content);
console.log('Successfully safely updated calendar-screen.tsx');
