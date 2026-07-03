"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Root = AccordionPrimitive.Root as React.FC<{
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}>;

const Item = AccordionPrimitive.Item as React.FC<{
  value?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}>;

const Trigger = AccordionPrimitive.Trigger as React.FC<{
  className?: string;
  children?: React.ReactNode;
}>;

const Panel = AccordionPrimitive.Panel as React.FC<{
  className?: string;
  children?: React.ReactNode;
}>;

function Accordion({
  className,
  children,
  ...props
}: AccordionPrimitive.Root.Props<string> & { className?: string; children?: React.ReactNode }) {
  return (
    <Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Root>
  );
}

function AccordionItem({
  className,
  children,
  ...props
}: AccordionPrimitive.Item.Props & { className?: string; children?: React.ReactNode }) {
  return (
    <Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Item>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props & { className?: string; children?: React.ReactNode }) {
  return (
    <Trigger data-slot="accordion-trigger"
      className={cn(
        "group flex flex-1 items-center justify-between gap-6 py-6 text-start text-base font-bold text-foreground outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&[data-open]>svg]:rotate-180",
        className,
      )}
      {...(props as Record<string, unknown>)}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </Trigger>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props & { className?: string; children?: React.ReactNode }) {
  return (
    <Panel data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm leading-relaxed text-muted-foreground data-ending-style:animate-out data-ending-style:fade-out data-starting-style:animate-in data-starting-style:fade-in",
        className,
      )}
      {...(props as Record<string, unknown>)}
    >
      <div className="pb-6 pt-0">{children}</div>
    </Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
