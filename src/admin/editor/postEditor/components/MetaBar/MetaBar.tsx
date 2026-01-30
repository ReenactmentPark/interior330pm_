import styles from './MetaBar.module.css';
import type { EditorKind, PostDraft } from '../../postEditor.types';

type Props = {
  kind: EditorKind;
  draft: PostDraft;
  onKindChange: (kind: EditorKind) => void;
  onChange: <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => void;
};

// ✅ draft.category가 undefined일 수 있으니, UI 전용 키를 추가로 포함
type InteriorCategoryUIKey = NonNullable<PostDraft['category']> | 'categoryDefault';

const INTERIOR_CATEGORY_OPTIONS: Array<{ value: InteriorCategoryUIKey; label: string }> = [
  { value: 'categoryDefault', label: '카테고리를 선택해주세요. (카페/음식점/상가/아파트/기타)' },
  { value: 'cafe', label: '카페' },
  { value: 'restaurant', label: '음식점' },
  { value: 'commercial', label: '상가' },
  { value: 'apartment', label: '아파트' },
  { value: 'etc', label: '기타' },
];

export default function MetaBar({ kind, draft, onKindChange, onChange }: Props) {
  const isFurniture = kind === 'furniture';

  // ✅ draft.category가 없거나 이상값이면 categoryDefault로 떨어뜨림
  const categoryValue: InteriorCategoryUIKey =
    draft.category === 'cafe' ||
    draft.category === 'restaurant' ||
    draft.category === 'commercial' ||
    draft.category === 'apartment' ||
    draft.category === 'etc'
      ? draft.category
      : 'categoryDefault';

  return (
    <section className={styles.wrap} aria-label="게시글 메타 입력">
      <div className={styles.grid}>
        {/* 게시판 선택 */}
        <div className={styles.field}>
          <select
            className={styles.control}
            value={kind}
            onChange={(e) => onKindChange(e.target.value as EditorKind)}
            aria-label="게시판 선택"
          >
            <option value="interior">인테리어디자인</option>
            <option value="furniture">가구제작</option>
          </select>
        </div>

        {/* 카테고리 */}
        <div className={styles.field}>
          {isFurniture ? (
            <div className={`${styles.control} ${styles.disabled}`} aria-label="카테고리 선택 비활성">
              카테고리 선택 불가 (가구제작)
            </div>
          ) : (
            <select
              className={styles.control}
              value={categoryValue}
              onChange={(e) => {
                const v = e.target.value as InteriorCategoryUIKey;

                // ✅ UI 옵션(categoryDefault)을 선택하면 draft에는 "비움"
                if (v === 'categoryDefault') {
                  onChange('category', undefined as any);
                  return;
                }

                onChange('category', v as any);
              }}
              aria-label="카테고리 선택"
            >
              {INTERIOR_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 제목 */}
        <div className={styles.field}>
          <input
            className={styles.control}
            value={draft.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="제목을 입력해주세요."
            aria-label="제목"
          />
        </div>

        {/* 기간 */}
        <div className={styles.field}>
          <input
            className={styles.control}
            value={draft.period}
            onChange={(e) => onChange('period', e.target.value)}
            placeholder="기간을 입력해주세요."
            aria-label="기간"
          />
        </div>
      </div>
    </section>
  );
}
