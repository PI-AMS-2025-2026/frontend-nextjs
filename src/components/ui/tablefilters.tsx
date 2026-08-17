"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FilterOption = {
  label: string;
  value: string;
};

type FilterField = {
  name: string;
  label?: string;
  showLabel?: boolean;
  type?: "input" | "select";
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: string;
  width?: string;
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
  const createInitialValues = () => {
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = field.defaultValue ?? "";
      return acc;
    }, {});
  };

  const [filters, setFilters] =
    React.useState<Record<string, string>>(createInitialValues);

  const handleChange = (name: string, value: string) => {
    const updatedFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(updatedFilters);
    onChange?.(updatedFilters);
  };

  const handleClear = () => {
    const clearedFilters = fields.reduce<Record<string, string>>(
      (acc, field) => {
        acc[field.name] = "";
        return acc;
      },
      {},
    );

    setFilters(clearedFilters);
    onClear?.();
    onChange?.(clearedFilters);
  };

  return (
    <div
      className={cn(
        "flex w-full items-end gap-4 rounded-[5px] border border-[#C8DDE2] bg-[#F1FBFD] px-4 py-2",
        className,
      )}
    >
      {fields.map((field) => (
        <div key={field.name} className={cn("w-[173px]", field.width)}>
          {field.type === "select" ? (
            <div className="w-full">
              {field.showLabel !== false && field.label && (
                <label className="mb-2 block text-sm font-medium text-[#17264D]">
                  {field.label}
                </label>
              )}

              <select
                value={filters[field.name] ?? ""}
                onChange={(event) =>
                  handleChange(field.name, event.target.value)
                }
                className="h-[32px] w-full rounded-[10px] border border-[#17264D] bg-[#F2F2F2] px-3 text-[14px] text-[#17264D] outline-none transition-colors focus:border-[#4471E6]"
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
            </div>
          ) : (
            <Input
              label={field.label}
              showLabel={field.showLabel ?? true}
              height="32px"
              placeholder={field.placeholder}
              value={filters[field.name] ?? ""}
              onChange={(event) => handleChange(field.name, event.target.value)}
              className="w-full rounded-[10px] text-[14px]"
            />
          )}
        </div>
      ))}

      <div className="ml-auto">
        <Button variant="secondary" size="small" onClick={handleClear}>
          {clearButtonLabel}
        </Button>
      </div> 
    </div>
  );
}

export { TableFilters };
