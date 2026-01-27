import styles from './FurnitureHeaderSection.module.css';
import type { InteriorCategory, InteriorCategoryKey } from '@/types/page';

type Props = {
  title: string;
  description: string;
  categories: InteriorCategory[];
  activeCategory: InteriorCategoryKey;
  onChangeCategory: (k: InteriorCategoryKey) => void;
};

export default function FurnitureHeaderSection({
  title,
  description,
  categories,
  activeCategory,
  onChangeCategory,
}: Props) {
  const showFilter = categories.length > 1;

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.desc}>{description}</p>

      {showFilter && (
        <nav className={styles.filter} aria-label="카테고리 필터">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.filterItem} ${activeCategory === c.key ? styles.active : ''}`}
              onClick={() => onChangeCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
