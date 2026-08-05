'use client';

import { useEffect } from 'react';
import Modal from '../Modal/Modal';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  open: boolean;
  message: string;
  autoCloseMs?: number;
  onClose: () => void;
}

/**
 * Modal de feedback de sucesso, exibido após cadastro/edição/exclusão.
 * Fecha automaticamente após `autoCloseMs` milissegundos.
 */
export default function SuccessModal({
  open,
  message,
  autoCloseMs = 2000,
  onClose,
}: SuccessModalProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(timer);
  }, [open, autoCloseMs, onClose]);

  return (
    <Modal open={open} onClose={onClose} width="320px">
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--color-accent-blue)" strokeWidth="2" />
            <path
              d="M7.5 12.5L10.3 15.3L16.5 9"
              stroke="var(--color-accent-blue)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </Modal>
  );
}
