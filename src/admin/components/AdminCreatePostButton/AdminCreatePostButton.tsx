import { Link } from 'react-router-dom';
import styles from './AdminCreatePostButton.module.css';

type Props = {
  to: string;
  label?: string;
};

export default function AdminCreatePostButton({ to, label = '게시글 추가' }: Props) {
  return (
    <Link to={to} className={styles.button}>
      {label}
      <span className={styles.icon} aria-hidden="true">
        +
      </span>
    </Link>
  );
}
