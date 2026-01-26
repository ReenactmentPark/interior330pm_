import styles from './Footer.module.css';
import { siteFooter } from '@/config/site';

export default function Footer() {
  const { leftLines, rightLinks, copyright } = siteFooter;

  return (
    <footer className={styles.footer} aria-label="사이트 푸터">
      <div className={styles.inner}>
        <div className={styles.left}>
          {leftLines.map((line) => (
            <p key={line} className={styles.line}>
              {line}
            </p>
          ))}
          <p className={styles.copy}>{copyright}</p>
        </div>

        <div className={styles.right}>
          {rightLinks.map((l) => (
            <a
              key={l.label}
              className={styles.link}
              href={l.href}
              target="_blank"
              rel="noreferrer"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
