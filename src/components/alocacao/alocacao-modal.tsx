"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  titulo: string;
  children: ReactNode;
  onClose: () => void;
  compacto?: boolean;
  alerta?: boolean;
};

export default function Modal({
  titulo,
  children,
  onClose,
  compacto,
  alerta,
}: ModalProps) {
  const tituloId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const fechar = useRef(onClose);
  fechar.current = onClose;

  useEffect(() => {
    const focoAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const container = ref.current;
    (
      container?.querySelector<HTMLElement>("[data-autofocus]") || container
    )?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        fechar.current();
      }
      if (event.key !== "Tab" || !container) return;
      const elementos = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]',
        ),
      ).filter((elemento) => elemento.getClientRects().length > 0);
      if (!elementos.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === primeiro ||
          document.activeElement === container)
      ) {
        event.preventDefault();
        ultimo.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === ultimo ||
          document.activeElement === container)
      ) {
        event.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowAnterior;
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role={alerta ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={tituloId}
        className={`relative max-h-[90dvh] w-full overflow-y-auto rounded-xl bg-white p-6 text-[#171717] shadow-xl outline-none ${compacto ? "max-w-[370px]" : "max-w-[480px]"}`}
      >
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-[#777777] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2
          id={tituloId}
          className={`pr-7 text-lg font-semibold leading-snug ${compacto ? "text-center" : ""}`}
        >
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
