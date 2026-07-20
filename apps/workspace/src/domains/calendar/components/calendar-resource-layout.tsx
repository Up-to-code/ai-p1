"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Columns3,
  GanttChart,
  LayoutList,
  Plus,
  Rows3,
} from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  ResourceWorkspaceLayout,
  type ResourceViewCatalogItem,
  type ResourceWorkspaceConfig,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCalendarStore } from "../store/calendar.store";
import {
  calendarHeaderLabel,
  calendarIsoDate,
  nextCalendarDate,
  type CalendarView,
} from "../calendar-view-model";

const CALENDAR_VIEWS = [
  {
    id: "month",
    label: "Month",
    href: "/calendar/month",
    icon: <CalendarDays className="h-3.5 w-3.5" />,
  },
  {
    id: "week",
    label: "Week",
    href: "/calendar/week",
    icon: <Columns3 className="h-3.5 w-3.5" />,
  },
  {
    id: "day",
    label: "Day",
    href: "/calendar/day",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
] as const;

const CALENDAR_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  {
    id: "month",
    label: "Month",
    description: "Full month overview with events",
    icon: <CalendarDays className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "week",
    label: "Week",
    description: "Seven-day view with time slots",
    icon: <Columns3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "day",
    label: "Day",
    description: "Single day detailed view",
    icon: <Clock3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Chronological event list",
    icon: <LayoutList className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Events displayed on a timeline",
    icon: <GanttChart className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
  {
    id: "split",
    label: "Split View",
    description: "Month grid with event side panel",
    icon: <Rows3 className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
];

function activeCalendarView(pathname: string): CalendarView {
  if (pathname.includes("/calendar/week")) return "week";
  if (pathname.includes("/calendar/day")) return "day";
  return "month";
}

export function CalendarResourceLayout({
  children,
  onAddEvent,
}: {
  children: React.ReactNode;
  onAddEvent: () => void;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentDate, setCurrentDate, view, setView } = useCalendarStore();
  const activeViewId = activeCalendarView(pathname);

  const views = useMemo(() => {
    const query = searchParams.toString();
    return CALENDAR_VIEWS.map((v) => ({
      ...v,
      href: query ? `${v.href}?${query}` : v.href,
    }));
  }, [searchParams]);

  const config: ResourceWorkspaceConfig = {
    resourceId: "calendar",
    title: "Calendar",
    activeViewId,
    views,
    actions: [
      {
        id: "new-event",
        label: "New event",
        icon: <Plus className="h-3.5 w-3.5" />,
        onClick: onAddEvent,
        variant: "primary",
      },
    ],
    viewCatalog: CALENDAR_VIEW_CATALOG,
    onAddView: (item) => {
      if (["month", "week", "day"].includes(item.id)) {
        const query = searchParams.toString();
        const href = query ? `/calendar/${item.id}?${query}` : `/calendar/${item.id}`;
        router.push(href);
      }
    },
  };

  return (
    <ResourceWorkspaceLayout
      config={config}
      toolbar={
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setCurrentDate(nextCalendarDate(currentDate, view, -1))}
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setCurrentDate(nextCalendarDate(currentDate, view, 1))}
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ms-1"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
          <h2 className="min-w-0 flex-1 text-center text-sm font-semibold text-foreground">
            {calendarHeaderLabel(currentDate, view, locale)}
          </h2>
        </div>
      }
    >
      {children}
    </ResourceWorkspaceLayout>
  );
}
