import { createPortal } from 'react-dom';
import styles from '../EditorToolbar.module.css';
import useEscapeClose from '../hooks/useEscapeClose';
import useOverlayPosition from '../hooks/useOverlayPosition';

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
};

export default function OverlayMenu({ open, anchorEl, width = 220, onClose, children }: Props) {
  const pos = useOverlayPosition(open, anchorEl, width);
  useEscapeClose(open, onClose);
  
  if (!open) return null;
  
  return createPortal(
    <div className={styles.overlayRoot} role="presentation">
      <button className={styles.backdrop} onClick={onClose} aria-label="닫기" />
      <div className={styles.menu} style={{ top: pos.top, left: pos.left, width }}>
        {children}
      </div>
    </div>,
    document.body
  );
}
