'use client';

import { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  width?: string;
  closeOnOverlayClick?: boolean;
  children: ReactNode;
}

/**
 * Modal base reutilizável.
 * Fornece o overlay escuro e o card branco central; o conteúdo específico de
 * cada modal (cadastro, edição, confirmação, sucesso) é passado via children.
 */
export default function Modal({
  open,
  onClose,
  width = '460px',
  closeOnOverlayClick = true,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => closeOnOverlayClick && onClose()}
    >
      <div
        className={styles.card}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
