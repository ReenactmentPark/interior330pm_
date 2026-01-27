import styles from './HomeGallerySection.module.css';
import { useHomePage } from '@/pages/Home/HomePageContext';
import { toSafeUrl } from '@/utils/safeUrl';

export default function HomeGallerySection() {
  const vm = useHomePage();
  if (!vm) return null;

  const cards = vm.images.cards.slice(0, 4);

  return (
    <section className={styles.section} aria-label="홈 갤러리">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {cards.map((card, idx) => {
            const src = toSafeUrl(card.url);
            if (!src) return null;

            const drop = idx === 0 || idx === 2; // 1,3번만
            return (
              <figure key={`${src}-${idx}`} className={`${styles.card} ${drop ? styles.drop : ''}`}>
                <div className={styles.thumb}>
                  <img src={src} alt={card.alt} loading="lazy" />
                </div>
              </figure>
            );
          })}

          {/* ✅ 텍스트는 2행 3~4열로 => width 제한 제거 */}
          <div className={styles.text}>
            <h2 className={styles.cardTitle}>
              {vm.galleryText.title}
              {vm.galleryText.highlight && (
                <span
                  className={styles.highlight}
                  style={vm.galleryText.highlight.color ? { color: vm.galleryText.highlight.color } : undefined}
                >
                  {vm.galleryText.highlight.text}
                </span>
              )}
            </h2>

            <p className={styles.cardDesc}>
              {vm.galleryText.description.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
