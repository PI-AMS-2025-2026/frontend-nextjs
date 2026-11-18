"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TableColumn<T> {
  key: string;
  label: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
  disabled?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  actions?: TableAction<T>[];
  getRowKey?: (item: T, index: number) => React.Key;
  className?: string;
  tableClassName?: string;
  compact?: boolean;
}

function DataTable<T>({
  data,
  columns,
  emptyMessage = "Nenhum registro encontrado.",
  actions = [],
  getRowKey,
  className,
  tableClassName,
  compact = false,
}: DataTableProps<T>) {
  const cellPadding = compact ? "px-3.5" : "px-6";

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-[10px] border border-[#C8CDD2]",
        className,
      )}
    >
      <table className={cn("w-full border-collapse", tableClassName)}>
        {/* Cabeçalho */}
        <thead>
          <tr className="h-[51px] bg-[#0099AA] text-white">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  cellPadding,
                  "text-left text-[15px] font-semibold",
                  column.headerClassName,
                )}
              >
                {column.label}
              </th>
            ))}

            {actions.length > 0 && (
              <th
                className={cn(
                  cellPadding,
                  "text-right text-[15px] font-semibold",
                )}
              >
                Ações
              </th>
            )}
          </tr>
        </thead>

        {/* Corpo */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                className="px-6 py-8 text-center text-sm text-[#17264D]/70"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={getRowKey?.(item, index) ?? index}
                className={cn(
                  "h-[46px] border-b border-[#D0D4D8] last:border-b-0",
                  index % 2 === 0 ? "bg-white" : "bg-[#F0F0F0]",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      cellPadding,
                      "py-2 text-[15px] text-[#171717]",
                      column.cellClassName,
                    )}
                  >
                    {column.render
                      ? column.render(item, index)
                      : String(
                          (item as Record<string, unknown>)[column.key] ?? "",
                        )}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className={cn(cellPadding, "py-2")}>
                    <div className="flex justify-end gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          aria-label={action.label}
                          title={action.label}
                          onClick={() => action.onClick(item)}
                          disabled={action.disabled?.(item) ?? false}
                          className={cn(
                            "flex size-[34px] items-center justify-center rounded-[7px]",
                            "border border-[#D0D4D8] bg-white",
                            "text-[#0099AA] transition-colors",
                            "hover:bg-[#0099AA]/10",
                            "disabled:pointer-events-none disabled:opacity-50",
                            action.className,
                          )}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };