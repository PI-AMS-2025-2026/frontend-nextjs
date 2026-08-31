"use client";

import * as React from "react";
import { Calendar, Eye, EyeOff, Lock, Search } from "lucide-react";

import { cn } from "@/lib/utils";

// ====================
// INPUT PROPS
// ====================

interface InputLabelProps {
  label?: string;
  showLabel?: boolean;
  height?: string;
  className?: string;
}

// ====================
// INPUT SIMPLES
// ====================

interface InputProps
  extends Omit<React.ComponentProps<"input">, "height">, InputLabelProps {}

function Input({
  className,
  label,
  showLabel = false,
  height = "50px",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {showLabel && label && (
        <label className="mb-2 block text-sm font-medium text-[#17264D]">
          {label}
        </label>
      )}

      <input
        data-slot="input"
        style={{ height }}
        className={cn(
          "w-full min-w-0 rounded-[15px] border border-[#17264D] bg-[#F2F2F2] px-3 text-base text-[#17264D] outline-none transition-colors",
          "placeholder:text-gray-500",
          "focus:border-[#4471E6]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// ====================
// DATE INPUT
// ====================

interface DateInputProps
  extends Omit<React.ComponentProps<"input">, "height">, InputLabelProps {}

function DateInput({
  className,
  label,
  showLabel = false,
  height = "50px",
  ...props
}: DateInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const openCalendar = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
    }
  };

  return (
    <div className="w-full">
      {showLabel && label && (
        <label className="mb-2 block text-sm font-medium text-[#17264D]">
          {label}
        </label>
      )}

      <div className="relative w-full">
        <input
          ref={inputRef}
          type="date"
          data-slot="date-input"
          className={cn(
            "h-[50px] w-full min-w-0 rounded-[15px] border border-[#17264D] bg-[#F2F2F2] px-3 pr-11 text-base text-[#17264D] outline-none transition-colors",
            "focus:border-[#4471E6]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            className,
          )}
          {...props}
        />

        <button
          type="button"
          onClick={openCalendar}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#17264D] transition-colors hover:text-[#4471E6]"
          aria-label="Abrir calendário"
        >
          <Calendar className="size-5" />
        </button>
      </div>
    </div>
  );
}

// ====================
// SEARCH INPUT
// ====================

interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "height">, InputLabelProps {}

function SearchInput({
  className,
  label,
  showLabel = false,
  height = "50px",
  ...props
}: SearchInputProps) {
  return (
    <div className="w-full">
      {showLabel && label && (
        <label className="mb-2 block text-sm font-medium text-[#17264D]">
          {label}
        </label>
      )}

      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#17264D]" />

        <input
          type="search"
          data-slot="search-input"
          className={cn(
            "h-[50px] w-full min-w-0 rounded-[15px] border border-[#17264D] bg-[#F2F2F2] pl-10 pr-3 text-base text-[#17264D] outline-none transition-colors",
            "placeholder:text-gray-500",
            "focus:border-[#4471E6]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}

// ====================
// PASSWORD INPUT
// ====================

interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "height">, InputLabelProps {}

function PasswordInput({
  className,
  label,
  showLabel = false,
  height = "50px",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="w-full">
      {showLabel && label && (
        <label className="mb-2 block text-sm font-medium text-[#17264D]">
          {label}
        </label>
      )}

      <div className="relative w-full">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#17264D]" />

        <input
          type={showPassword ? "text" : "password"}
          data-slot="password-input"
          className={cn(
            "h-[50px] w-full min-w-0 rounded-[15px] border border-[#011F45] bg-[#F2F2F2] px-10 text-base text-[#17264D] outline-none transition-colors",
            "placeholder:text-gray-500",
            "focus:border-[#4471E6]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#17264D] transition-colors hover:text-[#4471E6]"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export { Input, DateInput, SearchInput, PasswordInput };
