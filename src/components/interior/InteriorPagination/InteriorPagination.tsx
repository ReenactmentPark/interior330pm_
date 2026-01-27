import styles from './InteriorPagination.module.css';

type Props = {
  page: number;
  totalCount: number;
  pageSize: number;
  maxButtons: number;
  onChange: (p: number) => void;
};

export default function InteriorPagination({
  page,
  totalCount,
  pageSize,
  maxButtons,
  onChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount === 0) return null;

  const groupIndex = Math.floor((page - 1) / maxButtons);
  const startPage = groupIndex * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  const showPrev = startPage > 1;
  const showNext = endPage < totalPages;

  return (
    <nav className={styles.pagination} aria-label="페이지네이션">
      {showPrev && (
        <button className={styles.btn} onClick={() => onChange(startPage - 1)}>
          ‹
        </button>
      )}

      {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
        const p = startPage + i;
        return (
          <button
            key={p}
            className={p === page ? styles.active : styles.btn}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        );
      })}

      {showNext && (
        <button className={styles.btn} onClick={() => onChange(endPage + 1)}>
          ›
        </button>
      )}
    </nav>
  );
}
