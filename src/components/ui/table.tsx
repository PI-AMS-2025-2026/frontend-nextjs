"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TableColumn<T> {
  key: string;
  label: React.ReactNode;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  getRowKey?: (item: T, index: number) => React.Key;
  className?: string;
}

function DataTable<T>({
  data,
  columns,
  actions = [],
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    /* w-max + min-w-full: cresce até caber o conteúdo (permitindo o scroll
       horizontal do pai), mas nunca fica menor que o container */
    <div
      className={cn(
        "w-max min-w-full overflow-hidden rounded-[10px] border border-[#C8CDD2]",
        className,
      )}
    >
      <table className="w-full border-collapse">
        {/* Cabeçalho */}
        <thead>
          <tr className="h-[51px] bg-[#0099AA] text-white">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-6 text-left text-[16px] font-semibold whitespace-nowrap",
                  column.headerClassName,
                )}
              >
                {column.label}
              </th>
            ))}

            {actions.length > 0 && (
              <th className="px-6 text-right text-[16px] font-semibold whitespace-nowrap">
                Ações
              </th>
            )}
          </tr>
        </thead>

        {/* Corpo */}
        <tbody>
          {data.map((item, index) => (
            <tr
              key={getRowKey?.(item, index) ?? index}
              className={cn(
                "h-[46px] border-b border-[#D0D4D8]",
                index % 2 === 0 ? "bg-white" : "bg-[#F0F0F0]",
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 text-[16px] whitespace-nowrap text-[#171717]"
                >
                  {column.render
                    ? column.render(item, index)
                    : String(
                      (item as Record<string, unknown>)[column.key] ?? "",
                    )}
                </td>
              ))}

              {actions.length > 0 && (
                <td className="px-6">
                  <div className="flex justify-end gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        aria-label={action.label}
                        title={action.label}
                        onClick={() => action.onClick(item)}
                        className={cn(
                          "flex size-[34px] items-center justify-center rounded-[7px]",
                          "border border-[#D0D4D8] bg-white",
                          "text-[#0099AA] transition-colors",
                          "hover:bg-[#0099AA]/10",
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };