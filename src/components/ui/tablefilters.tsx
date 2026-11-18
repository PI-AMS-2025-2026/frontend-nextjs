"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type FilterOption = {
  label: string;
  value: string;
};

type FilterField = {
  name: string;
  label?: string;
  showLabel?: boolean;
  type?: "input" | "select";
  inputType?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: string;
  width?: string;
  maxVisibleOptions?: number;
};

interface TableFiltersProps {
  fields: FilterField[];
  onChange?: (filters: Record<string, string>) => void;
  onClear?: () => void;
  clearButtonLabel?: string;
  className?: string;
}

function TableFilters({
  fields,
  onChange,
  onClear,
  clearButtonLabel = "Limpar filtros",
  className,
}: TableFiltersProps) {
  // Guarda só o que o usuário alterou; o resto vem do defaultValue.
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});

  const filters = React.useMemo(
    () =>
      fields.reduce<Record<string, string>>((acc, field) => {
        acc[field.name] = overrides[field.name] ?? field.defaultValue ?? "";
        return acc;
      }, {}),
    [fields, overrides],
  );

  const handleChange = (name: string, value: string) => {
    setOverrides((prev) => ({ ...prev, [name]: value }));
    onChange?.({ ...filters, [name]: value });
  };

  const handleClear = () => {
    const clearedFilters = fields.reduce<Record<string, string>>(
      (acc, field) => {
        acc[field.name] = "";
        return acc;
      },
      {},
    );

    setOverrides(clearedFilters);
    onClear?.();
    onChange?.(clearedFilters);
  };

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3 overflow-x-auto rounded-[5px] border border-[#C8DDE2] bg-[#F1FBFD] px-4 py-2.5",
        className,
      )}
    >
      {fields.map((field) => (
        <div
          key={field.name}
          className={cn("w-[173px] shrink-0", field.width)}
        >
          {field.type === "select" ? (
            <div className="w-full">
              {field.showLabel !== false && field.label && (
                <label className="mb-2 block whitespace-nowrap text-[15px] font-semibold text-[#17264D]">
                  {field.label}
                </label>
              )}

              {field.maxVisibleOptions ? (
                <Select
                  options={[
                    { label: field.placeholder ?? "", value: "" },
                    ...(field.options ?? []),
                  ]}
                  value={filters[field.name] ?? ""}
                  onChange={(value) => handleChange(field.name, value)}
                  maxVisibleOptions={field.maxVisibleOptions}
                  buttonClassName="h-[36px] py-0"
                  slimScrollbar
                />
              ) : <div className="relative w-full">
                <select
                  aria-label={
                    field.label ?? field.placeholder ?? field.name
                  }
                  value={filters[field.name] ?? ""}
                  onChange={(event) =>
                    handleChange(field.name, event.target.value)
                  }
                  className="h-[36px] w-full appearance-none rounded-[10px] border border-[#17264D] bg-[#F2F2F2] px-3 pr-8 text-[14px] text-[#17264D] outline-none transition-colors focus:border-[#4471E6]"
                >
                  {field.placeholder && (
                    <option value="">{field.placeholder}</option>
                  )}

                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#17264D]" />
              </div>}
            </div>
          ) : (
            <Input
              aria-label={
                field.label ?? field.placeholder ?? field.name
              }
              label={field.label}
              showLabel={field.showLabel ?? true}
              height="36px"
              type={field.inputType ?? "text"}
              placeholder={field.placeholder}
              value={filters[field.name] ?? ""}
              onChange={(event) =>
                handleChange(field.name, event.target.value)
              }
              className="w-full rounded-[10px] text-[14px]"
            />
          )}
        </div>
      ))}

      <div className="ml-auto flex shrink-0 items-center justify-center">
        <Button
          variant="secondary"
          size="small"
          onClick={handleClear}
          className="whitespace-nowrap"
        >
          {clearButtonLabel}
        </Button>
      </div>
    </div>
  );
}

export { TableFilters };