'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Funnel } from 'lucide-react';
import styles from './TurmasListagem.module.css';

export type FiltroStatus = 'todos' | 'ativo' | 'inativo';

interface TurmaStatusFilterProps {
  value: FiltroStatus;
  onChange: (value: FiltroStatus) => void;
}

const OPCOES: { value: FiltroStatus; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

/** Funil no cabeçalho da coluna Status. O popover vai por portal pra não criar scrollbar na tabela. */
export default function TurmaStatusFilter({ value, onChange }: TurmaStatusFilterProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const aberto = pos !== null;

  function alternar() {
    if (aberto) return setPos(null);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 160) });
  }

  useEffect(() => {
    if (!aberto) return;
    const fechar = () => setPos(null);
    const aoClicar = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (popRef.current?.contains(alvo) || btnRef.current?.contains(alvo)) return;
      fechar();
    };
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && fechar();
    document.addEventListener('mousedown', aoClicar);
    document.addEventListener('keydown', aoTeclar);
    window.addEventListener('scroll', fechar, true);
    window.addEventListener('resize', fechar);
    return () => {
      document.removeEventListener('mousedown', aoClicar);
      document.removeEventListener('keydown', aoTeclar);
      window.removeEventListener('scroll', fechar, true);
      window.removeEventListener('resize', fechar);
    };
  }, [aberto]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.funnel} ${value !== 'todos' ? styles.funnelActive : ''}`}
        onClick={alternar}
        aria-label="Filtrar por status"
        aria-expanded={aberto}
      >
        <Funnel size={14} />
      </button>

      {aberto &&
        createPortal(
          <div ref={popRef} className={styles.popover} style={{ top: pos.top, left: pos.left }} role="menu">
            {OPCOES.map((o) => (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={value === o.value}
                className={`${styles.popoverItem} ${value === o.value ? styles.popoverItemActive : ''}`}
                onClick={() => {
                  onChange(o.value);
                  setPos(null);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}