"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function Accordion({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...(props as any)}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

function AccordionItem({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...(props as any)}
    >
      {children}
    </AccordionPrimitive.Item>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <AccordionPrimitive.Header className="flex" {...({} as any)}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-6 py-6 text-start text-base font-bold text-foreground outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-primary [&[data-open]>svg]:rotate-180",
          className,
        )}
        {...(props as any)}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm leading-relaxed text-muted-foreground data-ending-style:animate-out data-ending-style:fade-out data-starting-style:animate-in data-starting-style:fade-in",
        className,
      )}
      {...(props as any)}
    >
      <div className="pb-6 pt-0">{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
