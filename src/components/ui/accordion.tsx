"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// ====================
// ACCORDION
// ====================

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[12px] border border-[#17264D]/20 bg-[#F2F2F2]",
        className
      )}
      {...props}
    />
  )
}

// ====================
// ACCORDION ITEM
// ====================

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-b border-[#17264D]/15 last:border-b-0",
        "transition-colors duration-200",
        "data-[state=open]:border-[#4471E6]",
        className
      )}
      {...props}
    />
  )
}

// ====================
// ACCORDION TRIGGER
// ====================

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex w-full items-center justify-between px-5 py-4 text-left",
          "text-base font-semibold text-[#17264D]",
          "outline-none transition-colors duration-200",
          "hover:bg-[#17264D]/5",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4471E6]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span>{children}</span>

        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-[#17264D]",
            "transition-transform duration-200 ease-in-out",
            "group-data-[state=open]:rotate-180"
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

// ====================
// ACCORDION CONTENT
// ====================

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm text-[#17264D]",
        "data-[state=open]:animate-accordion-down",
        "data-[state=closed]:animate-accordion-up"
      )}
      {...props}
    >
      <div
        className={cn(
          "border-t border-[#17264D]/10 px-5 py-4",
          "leading-relaxed",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
}