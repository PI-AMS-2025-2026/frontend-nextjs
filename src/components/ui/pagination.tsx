"use client";

import * as React from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  totalItems: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
}

function Pagination({
  totalItems,
  currentPage = 1,
  itemsPerPage = 6,
  onPageChange,
  onItemsPerPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const page = Math.min(Math.max(currentPage, 1), totalPages);

  const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;

  const endItem =
    totalItems === 0 ? 0 : Math.min(page * itemsPerPage, totalItems);

  const goToPage = (newPage: number) => {
    const validPage = Math.min(Math.max(newPage, 1), totalPages);

    onPageChange?.(validPage);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onItemsPerPageChange?.(Number(event.target.value));
  };

  const buttonClass = cn(
    "flex h-[42px] min-w-[42px] items-center justify-center",
    "rounded-[8px] border border-[#9FC8D1]",
    "bg-[#A8DCE5] text-[#17264D]",
    "text-base",
    "transition-colors duration-150",
    "hover:bg-[#8FCED9]",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <div className={cn("mt-8 flex w-full justify-center px-4", className)}>
      <div className="flex w-[80%] min-w-[700px] items-center gap-2 text-[16px]">
        {/* Itens por página */}
        <div className="flex h-[42px] items-center overflow-hidden rounded-[8px] border border-[#D0D7DB] bg-white">
          <span className="px-4 whitespace-nowrap">Itens por página:</span>

          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="h-full w-[45px] appearance-none border-l border-[#D0D7DB] bg-white text-center text-base outline-none"
            aria-label="Itens por página"
          >
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        {/* Primeira página */}
        <button
          type="button"
          className={buttonClass}
          onClick={() => goToPage(1)}
          disabled={page === 1}
          aria-label="Primeira página"
        >
          <ChevronsLeft className="size-6" />
        </button>

        {/* Página anterior */}
        <button
          type="button"
          className={buttonClass}
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* Página atual */}
        <div className="flex h-[42px] flex-1 items-center justify-center rounded-[8px] border border-[#82C4D0] bg-[#9DD5DF] px-6 whitespace-nowrap text-base text-[#17264D]">
          Página {page} de {totalPages}
        </div>

        {/* Próxima página */}
        <button
          type="button"
          className={buttonClass}
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Última página */}
        <button
          type="button"
          className={buttonClass}
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          aria-label="Última página"
        >
          <ChevronsRight className="size-6" />
        </button>

        {/* Registros */}
        <div className=" flex h-[42px] flex-1 items-center justify-center rounded-[8px] border border-[#D0D7DB] bg-white px-4 whitespace-nowrap text-base">
          Mostrando {startItem} a {endItem} de {totalItems} registros
        </div>
      </div>
    </div>
  );
}

export { Pagination };
