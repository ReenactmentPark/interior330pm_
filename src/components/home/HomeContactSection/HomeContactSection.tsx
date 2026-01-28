import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import styles from './HomeContactSection.module.css';
import { useHomePage } from '@/pages/Home/HomePageContext';
import { toSafeUrl } from '@/utils/safeUrl';

import EditableText from '@/admin/components/EditableText/EditableText';
import EditableImage from '@/admin/components/EditableImage/EditableImage';
import { useEditDraft } from '@/admin/context/EditDraftContext';

export default function HomeContactSection() {
  const vm = useHomePage();
  if (!vm) return null;

  const bg0 = useMemo(() => {
    return toSafeUrl((vm as any).cta?.backgroundUrl);
  }, [vm]);

  const { getImageUrl } = useEditDraft();
  const bg = bg0 ? getImageUrl('home.contact.bg', bg0) : '';

  const contactTitle =
    (vm as any).contactText?.title ??
    (vm as any).ctaText?.title ??
    (vm as any).cta?.title ??
    '';

  const contactDesc =
    (vm as any).contactText?.description ??
    (vm as any).ctaText?.description ??
    (vm as any).cta?.description ??
    '';

  return (
    <section
      className={styles.section}
      aria-label="프로젝트 문의"
      style={bg ? ({ ['--contact-bg' as any]: `url(${bg})` } as React.CSSProperties) : undefined}
    >
      {bg && <EditableImage id="home.contact.bg" src={bg} className={styles.bgEditor} />}

      <div className={styles.overlay}>
        <div className={styles.content}>
          <div className={styles.group}>
            <div className={styles.textGroup}>
              <EditableText id="home.contact.title" value={contactTitle} as="h2" className={styles.title} />
              <EditableText id="home.contact.desc" value={contactDesc} as="p" className={styles.desc} />
            </div>

            <Link className={styles.button} to="/inquiry">
              견적 문의하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
