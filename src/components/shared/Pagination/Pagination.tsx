'use client';

import styles from './Pagination.module.css';

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  totalItems,
  pageSize,
  currentPage,
  pageSizeOptions = [6, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  function goTo(page: number) {
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (clamped !== currentPage) {
      onPageChange(clamped);
    }
  }

  return (
    <div className={styles.bar}>
      <div className={styles.pageSize}>
        <span>Itens por página:</span>
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => goTo(1)}
          disabled={currentPage === 1}
          aria-label="Primeira página"
        >
          «
        </button>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        <span className={styles.current}>
          Página {currentPage} de {totalPages}
        </span>

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
        >
          ›
        </button>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => goTo(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Última página"
        >
          »
        </button>
      </div>

      <div className={styles.info}>
        Mostrando {rangeStart} a {rangeEnd} de {totalItems} registros
      </div>
    </div>
  );
}