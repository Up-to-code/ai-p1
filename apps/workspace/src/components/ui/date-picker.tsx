"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  contentClassName?: string;
}

export const calendarClassNames = {
  root: "p-3",
  months: "flex flex-col",
  month: "space-y-3",
  month_caption: "relative flex h-8 items-center justify-center",
  caption_label: "text-sm font-semibold text-foreground",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous: "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
  button_next: "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "flex size-8 items-center justify-center text-[11px] font-medium text-muted-foreground",
  weeks: "flex flex-col gap-1",
  week: "flex w-full",
  day: "size-8 text-center text-sm",
  day_button: "inline-flex size-8 items-center justify-center rounded-md text-sm font-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  selected: "rounded-md bg-primary text-primary-foreground",
  today: "font-semibold text-primary",
  outside: "text-muted-foreground/40",
  disabled: "text-muted-foreground/30",
};

export function DatePicker({ date, setDate, className, contentClassName }: DatePickerProps) {
  const t = useTranslations("DatePicker");

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{t("pickADate")}</span>}
          </Button>
        }
      />
      <PopoverContent className={cn("w-auto p-0", contentClassName)} align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md bg-transparent"
          buttonVariant="ghost"
        />
      </PopoverContent>
    </Popover>
  );
}
