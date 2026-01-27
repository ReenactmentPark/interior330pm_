import styles from './FurniturePagination.module.css';

type Props = {
  page: number;
  totalCount: number;
  pageSize: number;
  maxButtons: number; // 5
  onChange: (p: number) => void;
};

export default function FurniturePagination({
  page,
  totalCount,
  pageSize,
  maxButtons,
  onChange,
}: Props) {
  // ✅ 0개면 페이지네이션 자체 숨김
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // 안전장치: 현재 페이지가 범위 밖이면 보정
  const safePage = Math.min(Math.max(1, page), totalPages);

  // ✅ 5개 단위 그룹 (1~5, 6~10, 11~15 ...)
  const groupIndex = Math.floor((safePage - 1) / maxButtons);
  const startPage = groupIndex * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  // ✅ 1~5 구간에서는 < 없음, 다음 구간이 있으면 > 표시
  const showPrev = startPage > 1;
  const showNext = endPage < totalPages;

  return (
    <nav className={styles.pagination} aria-label="페이지네이션">
      {showPrev && (
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onChange(startPage - 1)}
          aria-label="이전 페이지 그룹"
        >
          ‹
        </button>
      )}

      {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
        const p = startPage + i;
        const active = p === safePage;

        return (
          <button
            key={p}
            type="button"
            className={active ? styles.pageNumber : styles.pageBtn}
            onClick={() => onChange(p)}
            aria-current={active ? 'page' : undefined}
          >
            {p}
          </button>
        );
      })}

      {showNext && (
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onChange(endPage + 1)}
          aria-label="다음 페이지 그룹"
        >
          ›
        </button>
      )}
    </nav>
  );
}
