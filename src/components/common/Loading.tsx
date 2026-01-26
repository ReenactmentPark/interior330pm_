import styles from './Loading.module.css';

type LoadingProps = {
  label?: string;
  fullscreen?: boolean;
};

export default function Loading({ label = '로딩 중', fullscreen = false }: LoadingProps) {
  return (
    <div
      className={`${styles.wrapper} ${fullscreen ? styles.fullscreen : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </div>
  );
}
