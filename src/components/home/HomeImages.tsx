import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomeImages.module.css';
import type { HomePageViewModel } from '@/types/page';

type Props = {
  vm: HomePageViewModel;
};

function toSafeUrl(raw?: string): string | null {
  if (!raw) return null;

  try {
    const url = new URL(raw, window.location.origin);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const isSameOrigin = url.origin === window.location.origin;

    if (!isHttp && !isSameOrigin) return null;
    return url.toString().replace(/["')\\]/g, '');
  } catch {
    return null;
  }
}

export default function HomeImages({ vm }: Props) {
  const heroUrl = useMemo(() => toSafeUrl(vm.images.heroUrl), [vm.images.heroUrl]);
  const ctaBg = useMemo(() => toSafeUrl(vm.cta.backgroundUrl), [vm.cta.backgroundUrl]);

  return (
    <section className={styles.wrapper} aria-label="홈 이미지 섹션">
      {/* 상단 풀 이미지 */}
      <div className={styles.fullImage}>
        {heroUrl ? (
          <img src={heroUrl} alt={vm.images.heroAlt} loading="lazy" />
        ) : (
          <div className={styles.imageFallback} aria-hidden />
        )}
      </div>

      {/* 카드 + 텍스트(3번째 카드 시작선 정렬) */}
      <div className={styles.cardSection}>
        <div className={styles.cardRow}>
          {vm.images.cards.map((card, index) => {
            const src = toSafeUrl(card.url);
            if (!src) return null;

            return (
              <img
                key={`${src}-${index}`}
                src={src}
                alt={card.alt}
                className={card.raised ? styles.raise : undefined}
                loading="lazy"
              />
            );
          })}
        </div>

        <div className={styles.cardText}>
          <h2 className={styles.cardTitle}>
            {vm.cardText.title}
            {vm.cardText.highlight ? (
              <span
                className={styles.highlight}
                style={vm.cardText.highlight.color ? { color: vm.cardText.highlight.color } : undefined}
              >
                {vm.cardText.highlight.text}
              </span>
            ) : null}
          </h2>

          <p className={styles.cardDesc}>
            {vm.cardText.description.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* 풀블리드 CTA */}
      <section
        className={styles.ctaSection}
        aria-label="프로젝트 문의"
        style={ctaBg ? { backgroundImage: `url(${ctaBg})` } : undefined}
      >
        <div className={styles.ctaOverlay}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>{vm.cta.title}</h2>

            <p className={styles.ctaDesc}>
              {vm.cta.description.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>

            <Link to={vm.cta.buttonTo} className={styles.ctaButton}>
              {vm.cta.buttonLabel}
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
