"use client";

import React from "react";
import { EditableText } from "@/components/ui/editable-text";
import { EditableTags } from "@/components/ui/editable-tags";
import { EditableSelect } from "@/components/ui/editable-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface EntityDetailHeaderAction {
  label: string;
  icon?: LucideIcon;
  variant?: "ghost" | "outline" | "default" | "destructive";
  onClick: () => void;
  destructive?: boolean;
}

export interface EntityDetailHeaderField {
  type: "text" | "tags" | "select";
  value: any;
  onChange: (value: any) => void;
  label?: string;
  options?: any;
  colorMapType?: string;
  defaultColors?: any;
  availableTags?: string[];
}

export interface EntityDetailHeaderProps {
  /** Entity name for the avatar */
  name: string;
  /** Entity name for editable title */
  title: string;
  /** Callback when title is updated */
  onTitleChange: (name: string) => void;
  /** Additional fields to display (tags, status, etc.) */
  fields?: EntityDetailHeaderField[];
  /** Action buttons to display on the right */
  actions?: EntityDetailHeaderAction[];
  /** Custom avatar content */
  avatarContent?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function EntityDetailHeader({
  name,
  title,
  onTitleChange,
  fields = [],
  actions = [],
  avatarContent,
  className,
}: EntityDetailHeaderProps) {
  return (
    <section className={cn("flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8", className)}>
      <div className="flex min-w-0 items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-2xl font-black uppercase text-background shadow-sm">
          {avatarContent || name.charAt(0)}
        </div>
        <div className="min-w-0 space-y-1.5 mt-1">
          <EditableText
            value={title}
            onChange={onTitleChange}
            as="h1"
            className="max-w-3xl text-3xl font-black leading-tight text-foreground tracking-tight"
          />
          
          {fields.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {fields.map((field, index) => {
                const showDivider = index > 0;
                
                if (field.type === "tags") {
                  return (
                    <React.Fragment key={index}>
                      {showDivider && <div className="h-4 w-px bg-border shrink-0" />}
                      <EditableTags
                        tags={field.value}
                        onChange={field.onChange}
                        availableTags={field.availableTags}
                      />
                    </React.Fragment>
                  );
                }
                
                if (field.type === "select") {
                  return (
                    <React.Fragment key={index}>
                      {showDivider && <div className="h-4 w-px bg-border shrink-0" />}
                      <EditableSelect
                        value={field.value}
                        options={field.options}
                        onChange={field.onChange}
                        colorMapType={field.colorMapType}
                        defaultColors={field.defaultColors}
                      />
                    </React.Fragment>
                  );
                }
                
                return null;
              })}
            </div>
          )}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
          {actions.map((action, index) => {
            const showDivider = index > 0 && !action.destructive;
            const Icon = action.icon;
            
            return (
              <React.Fragment key={index}>
                {showDivider && <div className="h-4 w-px bg-border mx-1 shrink-0" />}
                <Button
                  variant={action.variant || "ghost"}
                  size={action.icon ? "icon" : "sm"}
                  className={cn(
                    action.icon ? "h-9 w-9 rounded-lg" : "h-9 rounded-lg px-3 text-xs font-medium",
                    action.destructive
                      ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={action.onClick}
                  title={action.label}
                >
                  {Icon && <Icon className={action.icon ? "h-4 w-4" : "mr-2 h-3.5 w-3.5"} />}
                  {!action.icon && action.label}
                </Button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}
