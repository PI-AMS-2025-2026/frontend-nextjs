'use client';

import { useEffect, useRef, useState } from 'react';
import { CORES_DISCIPLINA } from '@/models/disciplina';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  value: string;
  onChange: (cor: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const corAtual = CORES_DISCIPLINA.find((c) => c.valor === value);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <span className={styles.swatch} style={{ background: value || '#e5e7eb' }} />
        <span className={styles.label}>{corAtual ? corAtual.nome : 'Selecione...'}</span>
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <div className={styles.panel}>
          {CORES_DISCIPLINA.map((c) => (
            <button
              key={c.valor}
              type="button"
              className={`${styles.option} ${value === c.valor ? styles.optionSelecionada : ''}`}
              onClick={() => {
                onChange(c.valor);
                setOpen(false);
              }}
            >
              <span className={styles.swatch} style={{ background: c.valor }} />
              {c.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
