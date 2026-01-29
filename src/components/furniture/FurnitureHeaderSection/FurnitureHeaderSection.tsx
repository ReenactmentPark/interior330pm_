import styles from './FurnitureHeaderSection.module.css';
import { useLocation } from 'react-router-dom';
import { useEditMode } from '@/admin/context/EditModeContext';
import AdminCreatePostButton from '@/admin/components/AdminCreatePostButton/AdminCreatePostButton';

type Props = {
  title: string;
  description: string;
};

export default function FurnitureHeaderSection({ title, description }: Props) {
  const { enabled } = useEditMode();
  const { pathname } = useLocation();
  const showCreate = enabled && pathname.startsWith('/admin/furniture');
  return (
    <header className={styles.header}>
      {showCreate && (
        <div className={styles.createPostBtnWrap}>
          <AdminCreatePostButton to="/admin/furniture/editor" />
        </div>
      )}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.desc}>{description}</p>
    </header>
  );
}
