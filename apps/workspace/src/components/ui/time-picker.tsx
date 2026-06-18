"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function formatTimeDisplay(timeStr: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function TimePicker({ value, onChange, label, error }: TimePickerProps) {
  const [hour, minute] = value ? value.split(":") : ["10", "00"];
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const hour12 = useMemo(() => {
    const h = parseInt(hour, 10);
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  }, [hour]);
  const isPM = parseInt(hour, 10) >= 12;

  function setHour(h: number) {
    const base = isPM ? h + 12 : h;
    const finalH = h === 12 ? (isPM ? 12 : 0) : base;
    onChange(`${String(finalH).padStart(2, "0")}:${minute}`);
  }

  function setMinute(m: string) {
    onChange(`${hour}:${m}`);
  }

  function togglePeriod() {
    const h = parseInt(hour, 10);
    const newH = isPM ? (h >= 12 ? h - 12 : h) : (h < 12 ? h + 12 : h);
    onChange(`${String(newH).padStart(2, "0")}:${minute}`);
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && (
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-colors hover:bg-muted/50",
            isOpen ? "border-foreground/30 bg-card" : value ? "border-border bg-card" : "border-dashed border-border bg-muted/50",
          )}
        >
          <Clock className={cn("h-4 w-4 shrink-0", value ? "text-muted-foreground" : "text-muted-foreground/60")} />
          <span className={cn("flex-1 truncate", value ? "text-foreground font-medium" : "text-muted-foreground")}>
            {value ? formatTimeDisplay(value) : "Pick a time"}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute inset-x-0 top-full z-[200] mt-2 w-[280px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {/* Current time display */}
            <div className="flex items-center justify-center gap-2 border-b border-border px-4 py-3">
              <span className="text-xl font-bold tabular-nums text-foreground">
                {hour12}:{minute}
              </span>
              <button
                type="button"
                onClick={togglePeriod}
                className="rounded-lg border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {isPM ? "PM" : "AM"}
              </button>
            </div>

            {/* Columns: Hours | Minutes */}
            <div className="flex max-h-[240px]">
              {/* Hours column */}
              <div className="flex-1 border-r border-border">
                <div className="px-3 py-2 border-b border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground/60">Hour</span>
                </div>
                <div className="overflow-y-auto max-h-[200px]">
                  {HOURS_12.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHour(h)}
                      className={cn(
                        "flex h-10 w-full items-center justify-center text-sm font-medium transition-colors",
                        hour12 === h
                          ? "bg-foreground text-background font-semibold"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes column */}
              <div className="flex-1">
                <div className="px-3 py-2 border-b border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground/60">Min</span>
                </div>
                <div className="overflow-y-auto max-h-[200px]">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinute(m)}
                      className={cn(
                        "flex h-10 w-full items-center justify-center text-sm font-medium transition-colors",
                        minute === m
                          ? "bg-foreground text-background font-semibold"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
