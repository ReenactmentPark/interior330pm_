// src/components/board/BoardListSection/BoardListSection.tsx
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import styles from './BoardListSection.module.css';
import InteriorPagination from '@/components/interior/InteriorPagination/InteriorPagination';
import type { InteriorProject } from '@/types/page';

type Props = {
  kind: 'interior' | 'furniture';
  items: InteriorProject[];
};

const PAGE_SIZE = 10;

export default function BoardListSection({ kind, items }: Props) {
  const [page, setPage] = useState(1);

  const totalCount = items.length;

  const sliced = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <section className={styles.section} aria-label="게시글 목록">
      <div className={styles.headerRow}>
        <h2 className={styles.title}>목록</h2>
        <Link className={styles.all} to={`/${kind}`}>
          전체보기
        </Link>
      </div>

      <div className={styles.table}>
        {sliced.map((p) => (
          <Link key={p.id} to={p.to} className={styles.row}>
            <span className={styles.rowTitle}>{p.title}</span>
            <span className={styles.rowMeta}>{p.period}</span>
          </Link>
        ))}
      </div>

      <InteriorPagination
        page={page}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        maxButtons={5}
        onChange={setPage}
      />
    </section>
  );
}
