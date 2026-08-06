'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ColumnFilter.module.css';

interface ColumnFilterTextProps {
  label: string;
  kind: 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ColumnFilterSelectProps {
  label: string;
  kind: 'select';
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

type ColumnFilterProps = ColumnFilterTextProps | ColumnFilterSelectProps;

/**
 * Cabeçalho de coluna clicável que abre um popover de filtro.
 * - kind="text": um campo de texto (filtra por "contém").
 * - kind="select": uma lista de checkboxes com os valores distintos da coluna.
 *
 * O popover é renderizado via Portal direto no <body>, e não como filho
 * normal aqui dentro do <th>. Isso é necessário porque o cabeçalho da
 * tabela vive dentro de um container com `overflow-x: auto` (o scroll
 * lateral da tabela de Disciplinas) — um elemento `position: absolute`
 * que "vaza" pra fora dos limites desse container ainda conta como
 * conteúdo dele, então o navegador cria uma scrollbar vertical extra só
 * pra caber o popover. Renderizando fora da árvore (no <body>, posicionado
 * via coordenadas de tela) o popover para de influenciar o scroll da
 * tabela.
 */
export default function ColumnFilter(props: ColumnFilterProps) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function atualizarPosicao() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPanelPos({ top: rect.bottom + 8, left: rect.left });
      }
    }
    atualizarPosicao();

    function onClickOutside(e: MouseEvent) {
      const alvo = e.target as Node;
      const clicouNoBotao = triggerRef.current?.contains(alvo);
      const clicouNoPainel = panelRef.current?.contains(alvo);
      if (!clicouNoBotao && !clicouNoPainel) {
        setOpen(false);
      }
    }

    // Como o popover não é mais filho do container com scroll, ele não se
    // move sozinho quando a tabela rola. Mais simples e seguro do que
    // recalcular a posição a cada evento de scroll: só fecha o popover.
    function onScrollOuResize() {
      setOpen(false);
    }

    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('scroll', onScrollOuResize, true);
    window.addEventListener('resize', onScrollOuResize);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('scroll', onScrollOuResize, true);
      window.removeEventListener('resize', onScrollOuResize);
    };
  }, [open]);

  const ativo = props.kind === 'text' ? props.value.trim().length > 0 : props.selected.length > 0;

  function limpar() {
    if (props.kind === 'text') {
      props.onChange('');
    } else {
      props.onChange([]);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${ativo ? styles.triggerAtivo : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {props.label}
        <span className={styles.chevron}>▾</span>
      </button>

      {open &&
        panelPos &&
        createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            style={{ position: 'fixed', top: panelPos.top, left: panelPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {props.kind === 'text' ? (
              <input
                type="text"
                autoFocus
                className={styles.textInput}
                placeholder={props.placeholder ?? 'Filtrar...'}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
              />
            ) : (
              <div className={styles.optionsList}>
                {props.options.map((opt) => (
                  <label key={opt} className={styles.optionItem}>
                    <input
                      type="checkbox"
                      checked={props.selected.includes(opt)}
                      onChange={() => {
                        const jaSelecionado = props.selected.includes(opt);
                        const novo = jaSelecionado
                          ? props.selected.filter((v) => v !== opt)
                          : [...props.selected, opt];
                        props.onChange(novo);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {ativo && (
              <button type="button" className={styles.clearBtn} onClick={limpar}>
                Limpar filtro
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}