"use client";

import * as React from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  description: string;
  className?: string;
}

export function HelpTooltip({ description, className }: HelpTooltipProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);

  return (
    <span className={cn("group relative inline-flex align-middle mx-2", className)}>
      <button
        type="button"
        aria-label={`Ajuda: ${description}`}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((atual) => !atual)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-current outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
      >
        <CircleHelp aria-hidden="true" className="size-[19px]" strokeWidth={2} />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-md bg-[#202020] px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-lg",
          "invisible opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          open && "visible opacity-100",
        )}
      >
        {description}
      </span>
    </span>
  );
}
