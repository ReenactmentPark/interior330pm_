import { Link } from 'react-router-dom';
import styles from './InteriorThumbSection.module.css';
import { toSafeUrl } from '@/utils/safeUrl';
import type { InteriorProject } from '@/types/page';

type Props = {
  projects: InteriorProject[];
};

export default function InteriorThumbSection({ projects }: Props) {
  if (projects.length === 0) return null;

  return (
    <div className={styles.grid} aria-label="프로젝트 썸네일">
      {projects.map((p) => {
        const src = toSafeUrl(p.thumbnailUrl);

        return (
          <Link key={p.id} to={p.to} className={styles.cardLink} aria-label={`${p.title} 이동`}>
            <article className={styles.card}>
              <div className={styles.thumb}>
                {src ? <img src={src} alt={p.title} loading="lazy" /> : <div className={styles.thumbFallback} />}
              </div>

              {/* ✅ Frame 33 */}
              <div className={styles.textBlock}>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardMeta}>{p.period}</p>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
