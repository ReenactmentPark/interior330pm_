import styles from './EditorTopBar.module.css';

type Props = {
  title: string;
  subtitle: string;
  meta?: string;
  onSave: () => void;
  onReset: () => void;
};

export default function EditorTopBar({ title, subtitle, meta, onSave, onReset }: Props) {
  return (
    <header className={styles.bar}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.subRow}>
          <p className={styles.subtitle}>{subtitle}</p>
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.ghost} onClick={onReset} type="button">
          초기화
        </button>
        <button className={styles.primary} onClick={onSave} type="button">
          저장
        </button>
      </div>
    </header>
  );
}
