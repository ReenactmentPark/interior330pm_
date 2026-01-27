import { useMemo } from 'react';
import styles from './HomeMainSection.module.css';
import { useHomePage } from '@/pages/Home/HomePageContext';
import { toSafeUrl } from '@/utils/safeUrl';

export default function HomeMainSection() {
  const vm = useHomePage();
  if (!vm) return null;

  const heroUrl = useMemo(() => toSafeUrl(vm.images.heroUrl), [vm.images.heroUrl]);

  return (
    <section className={styles.section} aria-label="홈 메인">
      <div className={styles.inner}>
        <h1 className={styles.title}>
          {vm.heroText.title}
          {vm.heroText.highlight && (
            <span
              className={styles.highlight}
              style={vm.heroText.highlight.color ? { color: vm.heroText.highlight.color } : undefined}
            >
              {vm.heroText.highlight.text}
            </span>
          )}
        </h1>

        <div className={styles.heroMedia}>
          {heroUrl ? (
            <img className={styles.heroImg} src={heroUrl} alt={vm.images.heroAlt} loading="lazy" />
          ) : (
            <div className={styles.imageFallback} aria-hidden />
          )}
        </div>
      </div>
    </section>
  );
}
