import { Link } from 'react-router-dom';
import styles from './BoardListSection.module.css';

type Kind = 'interior' | 'furniture';

type BaseItem = {
  id: string;
  title: string;
  period?: string;
  thumbnailUrl?: string;
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

export default function BoardListSection<T extends BaseItem>({ kind, items }: Props<T>) {
  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section} aria-label="목록">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>목록</h2>
          <Link className={styles.more} to={`/${kind}`}>
            전체보기
          </Link>
        </div>

        <div className={styles.grid}>
          {items.slice(0, 8).map((it) => (
            <Link key={it.id} to={getHref(kind, it)} className={styles.card}>
              {it.thumbnailUrl ? (
                <img className={styles.thumb} src={it.thumbnailUrl} alt="" loading="lazy" />
              ) : (
                <div className={styles.thumbFallback} />
              )}

              <div className={styles.meta}>
                <div className={styles.cardTitle}>{it.title}</div>
                {it.period ? <div className={styles.cardSub}>{it.period}</div> : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
