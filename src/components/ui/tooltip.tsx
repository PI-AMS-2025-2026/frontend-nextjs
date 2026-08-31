"use client"

import * as React from "react"
import {
  Tooltip as TooltipPrimitive,
} from "radix-ui"

import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  variant?: "primary" | "secondary"
  sideOffset?: number
  className?: string
}

function Tooltip({
  children,
  content,
  side = "top",
  variant = "primary",
  sideOffset = 6,
  className,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false)

  const tooltipColor =
    variant === "primary"
      ? "#17264D"
      : "#0099AA"

  return (
    <TooltipPrimitive.Provider
      delayDuration={0}
      skipDelayDuration={0}
    >
      <TooltipPrimitive.Root
        open={open}
        onOpenChange={setOpen}
      >
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            className={cn(
              "z-50 w-fit max-w-xs rounded-[8px] px-3 py-2 text-sm font-medium text-white shadow-md outline-none",
              "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-1",
              "data-[side=left]:slide-in-from-right-1",
              "data-[side=right]:slide-in-from-left-1",
              "data-[side=top]:slide-in-from-bottom-1",
              variant === "primary"
                ? "bg-[#17264D]"
                : "bg-[#0099AA]",
              className
            )}
          >
            {content}

            <TooltipPrimitive.Arrow
              width={12}
              height={6}
              style={{
                fill: tooltipColor,
              }}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { Tooltip }