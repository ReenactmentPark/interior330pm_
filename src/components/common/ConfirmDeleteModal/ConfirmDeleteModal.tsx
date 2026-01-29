import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ConfirmDeleteModal.module.css';

type Props = {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDeleteModal({ open, title, onConfirm, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="삭제 확인">
      <div className={styles.panel}>
        <div className={styles.titlePill}>{title}</div>

        <div className={styles.message}>삭제하시겠습니까?</div>

        <div className={styles.actions}>
          <button className={styles.danger} onClick={onConfirm} type="button">
            삭제
          </button>
          <button className={styles.cancel} onClick={onClose} type="button">
            취소
          </button>
        </div>
      </div>

      {/* backdrop 클릭 닫기 */}
      <button className={styles.backdropClickCatcher} onClick={onClose} aria-label="닫기" type="button" />
    </div>,
    document.body
  );
}
