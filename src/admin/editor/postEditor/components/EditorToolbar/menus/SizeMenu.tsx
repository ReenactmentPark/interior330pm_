import styles from '../EditorToolbar.module.css';
import { SIZE_OPTIONS } from '../constants/sizes';

type Props = {
  current: number;
  onPick: (size: number) => void;
  onMouseDownItem: (e: React.MouseEvent) => void;
};

export default function SizeMenu({ current, onPick, onMouseDownItem }: Props) {
  return (
    <div className={styles.menuList}>
      {SIZE_OPTIONS.map((sz) => {
        const active = sz === current;
        return (
          <button
            key={sz}
            className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
            type="button"
            onMouseDown={onMouseDownItem}
            onClick={() => onPick(sz)}
          >
            <span className={styles.check}>{active ? '✓' : ''}</span>
            <span className={styles.itemText}>{sz}</span>
          </button>
        );
      })}
    </div>
  );
}
