import { useMemo } from 'react';
import styles from './HomeHeaderSection.module.css';
import { useHomePage } from '@/pages/Home/HomePageContext';
import { toSafeUrl } from '@/utils/safeUrl';

import EditableText from '@/admin/components/EditableText/EditableText';
import EditableImage from '@/admin/components/EditableImage/EditableImage';
import { useEditDraft } from '@/admin/context/EditDraftContext';

export default function HomeHeaderSection() {
  const vm = useHomePage();
  if (!vm) return null;

  const heroUrlRaw = useMemo(() => toSafeUrl(vm.images.heroUrl), [vm.images.heroUrl]);

  // ✅ 관리자에서 이미지 프리뷰 URL 반영
  const { getImageUrl } = useEditDraft();
  const heroUrl = heroUrlRaw ? getImageUrl('home.header.hero', heroUrlRaw) : null;

  return (
    <header className={styles.section} aria-label="홈 헤더">
      <div className={styles.inner}>
        <h1 className={styles.title}>
          <EditableText id="home.header.title" value={vm.heroText.title} as="span" />
          {vm.heroText.highlight && (
            <span
              className={styles.highlight}
              style={vm.heroText.highlight.color ? { color: vm.heroText.highlight.color } : undefined}
            >
              <EditableText
                id="home.header.highlight"
                value={vm.heroText.highlight.text}
                as="span"
              />
            </span>
          )}
        </h1>

        <div className={styles.heroMedia}>
          {heroUrl ? (
            <EditableImage
              id="home.header.hero"
              src={heroUrl}
              alt={vm.images.heroAlt}
              imgClassName={styles.heroImg}
            />
          ) : (
            <div className={styles.imageFallback} aria-hidden />
          )}
        </div>
      </div>
    </header>
  );
}
