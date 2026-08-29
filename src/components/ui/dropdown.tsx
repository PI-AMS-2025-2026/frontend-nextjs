"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`relative w-full overflow-visible ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-lg border bg-[#F2F2F2] px-3 py-2 text-sm transition-colors duration-200 ${
          open ? "border-[#4471E6]" : "border-[#17264D]"
        }`}
      >
        {selectedOption?.label || placeholder}

        <ChevronDown
          className={`size-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[99999] mt-1 w-full overflow-visible rounded-lg border bg-background shadow-md">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className={`w-full border border-transparent px-3 py-2 text-left text-sm transition-colors duration-150 rounded-lg hover:bg-[#F2F2F2] ${
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
