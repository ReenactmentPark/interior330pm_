import { Link } from 'react-router-dom';
import styles from './BoardListSection.module.css';
import { useMemo, useState } from 'react';
import InteriorPagination from '@/components/interior/InteriorPagination/InteriorPagination';

type Kind = 'interior' | 'furniture';

type BaseItem = {
  id: string;
  title: string;
  period?: string;
  to?: string;
};

type Props<T extends BaseItem> = {
  kind: Kind;
  items: T[];
};

function getHref(kind: Kind, item: BaseItem) {
  // 1) 데이터에 to가 있으면 그걸 우선
  if (item.to) return item.to;

  // 2) 없으면 kind 기준으로 생성
  return `/${kind}/${item.id}`;
}

const PAGE_SIZE = 5;

export default function BoardListSection<T extends BaseItem>({ kind, items }: Props<T>) {
  const [page, setPage] = useState(1);

  const totalCount = items.length;

  const sliced = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);
  return (
    <section className={styles.section} aria-label="게시글 목록">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>목록</h2>
          <Link className={styles.overview} to={`/${kind}`}>
            전체보기
          </Link>
        </div>

        <div className={styles.table}>
          {sliced.map((p) => (
            <Link key={p.id} to={getHref(kind, p)} className={styles.row}>
              <span className={styles.rowTitle}>{p.title}</span>
              <span className={styles.rowMeta}>{p.period}</span>
            </Link>
          ))}
        </div>
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
