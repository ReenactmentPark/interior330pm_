import styles from './HomeGallerySection.module.css';
import { useHomePage } from '@/pages/Home/HomePageContext';
import { toSafeUrl } from '@/utils/safeUrl';

import EditableText from '@/admin/components/EditableText/EditableText';
import EditableImage from '@/admin/components/EditableImage/EditableImage';
import { useEditDraft } from '@/admin/context/EditDraftContext';

export default function HomeGallerySection() {
  const vm = useHomePage();
  if (!vm) return null;

  const cards = vm.images.cards.slice(0, 4);
  const { getImageUrl } = useEditDraft();

  return (
    <section className={styles.section} aria-label="홈 갤러리">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {cards.map((card, idx) => {
            const src0 = toSafeUrl(card.url);
            if (!src0) return null;

            const id = `home.gallery.card.${idx}`;
            const src = getImageUrl(id, src0);

            const drop = idx === 0 || idx === 2; // 1,3번만
            return (
              <figure key={`${src0}-${idx}`} className={`${styles.card} ${drop ? styles.drop : ''}`}>
                <div className={styles.thumb}>
                  <EditableImage
                    id={`home.gallery.card.${idx}`}
                    src={src}
                    alt={card.alt}
                    imgClassName={styles.thumbImg}
                  />
                </div>
              </figure>
            );
          })}

          <div className={styles.text}>
            <h2 className={styles.cardTitle}>
              <EditableText id="home.gallery.title" value={vm.galleryText.title} as="span" />
              {vm.galleryText.highlight && (
                <span
                  className={styles.highlight}
                  style={vm.galleryText.highlight.color ? { color: vm.galleryText.highlight.color } : undefined}
                >
                  <EditableText
                    id="home.gallery.highlight"
                    value={vm.galleryText.highlight.text}
                    as="span"
                  />
                </span>
              )}
            </h2>

            <p className={styles.cardDesc}>
              <EditableText
                id="home.gallery.desc"
                value={vm.galleryText.description}
                as="span"
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
