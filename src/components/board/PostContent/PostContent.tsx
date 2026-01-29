// src/components/board/PostContent/PostContent.tsx
import styles from './PostContent.module.css';
import type { PostBlock } from '@/data/postContent';
import { toSafeUrl } from '@/utils/safeUrl';

type Props = { blocks: PostBlock[] };

export default function PostContent({ blocks }: Props) {
  return (
    <div className={styles.content}>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case 'heading': {
            const Tag = (b.level ?? 2) === 3 ? 'h3' : 'h2';
            return (
              <Tag key={idx} className={(b.level ?? 2) === 3 ? styles.h3 : styles.h2}>
                {b.text}
              </Tag>
            );
          }
          case 'paragraph':
            return (
              <p key={idx} className={styles.p}>
                {b.text}
              </p>
            );
          case 'quote':
            return (
              <blockquote key={idx} className={styles.quote}>
                {b.text}
              </blockquote>
            );
          case 'link':
            return (
              <p key={idx} className={styles.p}>
                <a className={styles.link} href={b.href} target="_blank" rel="noreferrer noopener">
                  {b.label}
                </a>
              </p>
            );
          case 'image': {
            const src = toSafeUrl(b.url);
            if (!src) return null;
            return (
              <figure key={idx} className={styles.figure}>
                <img className={styles.img} src={src} alt={b.alt ?? ''} loading="lazy" />
              </figure>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
