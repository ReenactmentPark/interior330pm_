import { NavLink, Link } from 'react-router-dom';
import styles from './Header.module.css';
import HomeLogo from '@/assets/icons/330pm_logo.svg?react';

const menus = [
  { path: '/', label: '홈페이지' },
  { path: '/interior', label: '인테리어디자인' },
  { path: '/furniture', label: '가구제작' },
  { path: '/inquiry', label: '견적문의' },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* 왼쪽: 로고(클릭 시 홈으로) */}
        <Link to="/" className={styles.logo} aria-label="홈으로 이동">
          <HomeLogo className={styles.logoSvg} aria-hidden="true" focusable="false" />
        </Link>

        {/* 오른쪽: 메뉴 */}
        <div className={styles.menu}>
          {menus.map((m) => (
            <NavLink key={m.path} to={m.path}>
              {m.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
