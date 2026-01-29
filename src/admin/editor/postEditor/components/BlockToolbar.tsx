import styles from './BlockToolbar.module.css';
import type { PostBlockInput } from '../postEditor.types';

type Props = {
  onAdd: (block: PostBlockInput) => void;
};

export default function BlockToolbar({ onAdd }: Props) {
  return (
    <section className={styles.panel} aria-label="블록 추가">
      <div className={styles.sectionTitle}>블록 추가</div>

      <div className={styles.grid}>
        <button className={styles.btn} type="button" onClick={() => onAdd({ type: 'heading', level: 2, text: '섹션 제목' })}>
          제목(H2)
        </button>
        <button className={styles.btn} type="button" onClick={() => onAdd({ type: 'heading', level: 3, text: '소제목' })}>
          제목(H3)
        </button>
        <button className={styles.btn} type="button" onClick={() => onAdd({ type: 'paragraph', text: '문단' })}>
          문단
        </button>
        <button className={styles.btn} type="button" onClick={() => onAdd({ type: 'quote', text: '인용문' })}>
          인용
        </button>
        <button className={styles.btn} type="button" onClick={() => onAdd({ type: 'image', url: '', alt: '' })}>
          이미지(URL)
        </button>
        <button className={styles.btn} type="button" onClick={() => onAdd({ type: 'link', href: '', label: '링크' })}>
          링크
        </button>
      </div>
    </section>
  );
}
