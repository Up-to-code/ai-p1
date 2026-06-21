"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, Settings, ArrowLeft } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  NOTION_COLORS,
  NotionColorKey,
  getStoredColor,
  setStoredColor,
} from "@/lib/color-utils";

interface EditableSelectProps<T extends string> {
  value: T;
  options: { label: string; value: T; icon?: React.ElementType }[];
  onChange: (value: T) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  colorMapType?: string;
  defaultColors?: Record<string, NotionColorKey>;
}

export function EditableSelect<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className,
  triggerClassName,
  placeholder = "Select...",
  colorMapType,
  defaultColors,
}: EditableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingColors, setIsEditingColors] = useState(false);
  const [optionColors, setOptionColors] = useState<Record<string, NotionColorKey>>({});

  // Sync colors when options or type changes
  useEffect(() => {
    if (!colorMapType) return;
    const colorsMap: Record<string, NotionColorKey> = {};
    options.forEach((opt) => {
      const fallback = defaultColors?.[opt.value] || "gray";
      colorsMap[opt.value] = getStoredColor(colorMapType, opt.value, fallback);
    });
    setOptionColors(colorsMap);
  }, [options, colorMapType, defaultColors]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const activeColorKey = colorMapType && value ? (optionColors[value] || defaultColors?.[value] || "gray") : null;
  const activeColorStyle = activeColorKey ? NOTION_COLORS[activeColorKey] : null;

  const handleSelectOption = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleSetOptionColor = (optValue: string, color: NotionColorKey) => {
    if (!colorMapType) return;
    setStoredColor(colorMapType, optValue, color);
    setOptionColors((prev) => ({ ...prev, [optValue]: color }));
  };

  return (
    <div className={cn("inline-flex", className)}>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setIsEditingColors(false);
        }}
      >
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "inline-flex items-center justify-between gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all cursor-pointer shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
            activeColorStyle
              ? `${activeColorStyle.bg} ${activeColorStyle.text} ${activeColorStyle.border} hover:opacity-85`
              : "border-border bg-muted/50 text-foreground hover:bg-muted/80",
            disabled && "cursor-not-allowed opacity-60 hover:opacity-60",
            triggerClassName
          )}
        >
          {selectedOption?.icon && (
            <selectedOption.icon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span>{selectedOption?.label || value || placeholder}</span>
          <ChevronDown className="h-3 w-3 opacity-50 shrink-0 ml-0.5" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          {!isEditingColors ? (
            <div className="space-y-1">
              <div className="max-h-[220px] overflow-y-auto space-y-0.5 pr-1">
                {options.map((option) => {
                  const optColorKey = colorMapType ? (optionColors[option.value] || defaultColors?.[option.value] || "gray") : null;
                  const optColorStyle = optColorKey ? NOTION_COLORS[optColorKey] : null;
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectOption(option.value)}
                      className={cn(
                        "w-full flex items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer outline-none",
                        isSelected && "font-semibold bg-accent/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {optColorStyle ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold border shadow-sm",
                              optColorStyle.bg,
                              optColorStyle.text,
                              optColorStyle.border
                            )}
                          >
                            {option.icon && <option.icon className="mr-1 h-3 w-3" />}
                            {option.label}
                          </span>
                        ) : (
                          <>
                            {option.icon && <option.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                            <span>{option.label}</span>
                          </>
                        )}
                      </div>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>

              {colorMapType && (
                <>
                  <div className="h-px bg-border my-1" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditingColors(true);
                    }}
                    className="w-full flex items-center gap-1.5 rounded px-2 py-1 text-left text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer outline-none"
                  >
                    <Settings className="h-3 w-3" />
                    Customize colors...
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 border-b pb-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingColors(false)}
                  className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-semibold text-foreground">Customize Colors</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
                {options.map((option) => {
                  const optColorKey = optionColors[option.value] || defaultColors?.[option.value] || "gray";

                  return (
                    <div key={option.value} className="space-y-1">
                      <span className="text-[11px] font-semibold px-1 text-foreground">
                        {option.label}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(Object.keys(NOTION_COLORS) as NotionColorKey[]).map((cKey) => {
                          const cStyle = NOTION_COLORS[cKey];
                          const isSelected = optColorKey === cKey;
                          return (
                            <button
                              key={cKey}
                              type="button"
                              onClick={() => handleSetOptionColor(option.value, cKey)}
                              className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center transition-all cursor-pointer",
                                cStyle.bg,
                                cStyle.border,
                                "hover:scale-110",
                                isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                              )}
                              title={cKey}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full", cStyle.dot)} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
