import styles from './Footer.module.css';
import { siteFooter } from '@/config/site';

export default function Footer() {
  const { leftLines, rightLinks, copyright } = siteFooter;

  return (
    <footer className={styles.footer} aria-label="사이트 푸터">
      <div className={styles.inner}>
        {/* Left: Frame 3 */}
        <div className={styles.left}>
          <p className={styles.address}>
            {leftLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {line}
                {i < leftLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>

          <p className={styles.copy}>{copyright}</p>
        </div>

        {/* Right: Frame 4 */}
        <nav className={styles.right} aria-label="푸터 링크">
          {rightLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.link}
              target="_blank"
              rel="noreferrer noopener"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
