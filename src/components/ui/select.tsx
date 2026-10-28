"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTION_HEIGHT = 38;

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxVisibleOptions?: number;
  buttonClassName?: string;
  slimScrollbar?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
  maxVisibleOptions,
  buttonClassName,
  slimScrollbar,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className={`relative w-full overflow-visible ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-[#F2F2F2] px-3 py-2 text-sm transition-colors duration-200",
          open ? "border-[#4471E6]" : "border-[#17264D]",
          buttonClassName,
        )}
      >
        <span>{selectedOption?.label || placeholder}</span>

        <ChevronDown
          className={`size-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-[99999] mt-1 w-full rounded-lg border bg-background shadow-md",
            maxVisibleOptions ? "overflow-y-auto" : "overflow-visible",
            slimScrollbar &&
              "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8CDD2]",
          )}
          style={
            maxVisibleOptions
              ? { maxHeight: `${maxVisibleOptions * OPTION_HEIGHT}px` }
              : undefined
          }
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[#F2F2F2] ${
                index !== options.length - 1 ? "border-b-[#D9D9D9]" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
