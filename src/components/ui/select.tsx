"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

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
  menuClassName?: string;
  "aria-label"?: string;
  disabled?: boolean;
  maxVisibleOptions?: number;
  buttonClassName?: string;
  slimScrollbar?: boolean;
  inlineMenu?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
  menuClassName = "",
  "aria-label": ariaLabel,
  disabled = false,
  maxVisibleOptions,
  buttonClassName = "",
  slimScrollbar = false,
  inlineMenu = false,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`relative w-full overflow-visible ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-lg border bg-[#F2F2F2] px-3 py-2 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "border-[#4471E6]" : "border-[#17264D]"
        } ${buttonClassName}`}
      >
        <span className={inlineMenu ? "min-w-0 wrap-anywhere text-left" : undefined}>{selectedOption?.label || placeholder}</span>

        <ChevronDown
          className={`size-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`${inlineMenu ? "relative" : "absolute left-0 top-full z-[99999]"} mt-1 w-full overscroll-contain rounded-lg border bg-background shadow-md ${
            maxVisibleOptions ? "overflow-y-auto" : "overflow-visible"
          } ${slimScrollbar ? "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8CDD2]" : ""} ${menuClassName}`}
          style={maxVisibleOptions ? { maxHeight: `${maxVisibleOptions * OPTION_HEIGHT}px` } : undefined}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[#F2F2F2] ${inlineMenu ? "wrap-anywhere" : ""} ${
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
