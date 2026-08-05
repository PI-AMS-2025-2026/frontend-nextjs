'use client';

import Modal from '../Modal/Modal';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  submessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmação reutilizável (usado hoje para exclusão, mas genérico
 * o suficiente para qualquer confirmação futura).
 */
export default function ConfirmModal({
  open,
  title = 'Confirmação',
  message = 'Tem certeza que deseja continuar?',
  submessage = 'Esta ação não poderá ser desfeita.',
  confirmLabel = 'CONFIRMAR',
  cancelLabel = 'CANCELAR',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} width="420px">
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {submessage && <p className={styles.submessage}>{submessage}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.btnText} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={styles.btnPrimaryBlue}
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
