import { useLocation } from 'react-router-dom';
import styles from './InteriorHeaderSection.module.css';
import type { InteriorCategoryKey, InteriorCategory } from '@/types/page';
import { useEditMode } from '@/admin/context/EditModeContext';
import AdminCreatePostButton from '@/admin/components/AdminCreatePostButton/AdminCreatePostButton';

type Props = {
  title: string;
  description: string;
  categories: InteriorCategory[];
  activeCategory: InteriorCategoryKey;
  onChangeCategory: (k: InteriorCategoryKey) => void;
};

export default function InteriorHeaderSection({
  title,
  description,
  categories,
  activeCategory,
  onChangeCategory,
}: Props) {
  const { enabled } = useEditMode();
  const { pathname } = useLocation();
  const isAdminInterior = pathname.startsWith('/admin/interior');
  const showCreate = isAdminInterior && enabled;
  return (
    <header className={styles.header}>
      {showCreate && (
        <div className={styles.createPostBtnWrap}>
          <AdminCreatePostButton to="/admin/interior/editor" />
        </div>
      )}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.desc}>{description}</p>

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
    </header>
  );
}
