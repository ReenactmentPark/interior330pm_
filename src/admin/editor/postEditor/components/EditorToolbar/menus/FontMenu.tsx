import styles from '../EditorToolbar.module.css';
import { FONT_OPTIONS } from '../constants/fonts';

type Props = {
  current: string;
  onPick: (font: string) => void;
  onMouseDownItem: (e: React.MouseEvent) => void;
};

export default function FontMenu({ current, onPick, onMouseDownItem }: Props) {
  return (
    <div className={styles.menuList}>
      {FONT_OPTIONS.map((font) => {
        const active = font === current;
        return (
          <button
            key={font}
            className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
            type="button"
            onMouseDown={onMouseDownItem}
            onClick={() => onPick(font)}
          >
            <span className={styles.check}>{active ? '✓' : ''}</span>
            <span className={styles.itemText}>{font}</span>
          </button>
        );
      })}
    </div>
  );
}
