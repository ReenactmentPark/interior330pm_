import styles from '../EditorToolbar.module.css';
import alignLeftIcon from '@/assets/icons/align-left.svg';
import alignCenterIcon from '@/assets/icons/align-center.svg';
import alignRightIcon from '@/assets/icons/align-right.svg';
import type { TextAlign } from '../EditorToolbar';

type Props = {
  current: TextAlign;
  onPick: (align: TextAlign) => void;
  onMouseDownItem: (e: React.MouseEvent) => void;
};

export default function AlignMenu({ current, onPick, onMouseDownItem }: Props) {
  const item = (key: TextAlign, label: string, icon: string) => {
    const active = current === key;
    return (
      <button
        className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
        type="button"
        onMouseDown={onMouseDownItem}
        onClick={() => onPick(key)}
      >
        <span className={styles.check}>{active ? '✓' : ''}</span>
        <img className={styles.itemIcon} src={icon} alt="" />
        <span className={styles.itemText}>{label}</span>
      </button>
    );
  };

  return (
    <div className={styles.menuList}>
      {item('left', '왼쪽', alignLeftIcon)}
      {item('center', '가운데', alignCenterIcon)}
      {item('right', '오른쪽', alignRightIcon)}
    </div>
  );
}
