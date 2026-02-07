import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import styles from './Header.module.css';
import HomeLogo from '@/assets/icons/330pm_logo.svg?react';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';

const publicMenus = [
  { path: '/', label: '홈페이지' },
  { path: '/interior', label: '인테리어디자인' },
  { path: '/furniture', label: '가구제작' },
  { path: '/inquiry', label: '견적문의' },
];

// ✅ 관리자 메뉴 경로 (admin 안에서만 이동)
const adminMenus = [
  { path: '/admin/home', label: '홈페이지' },
  { path: '/admin/interior', label: '인테리어디자인' },
  { path: '/admin/furniture', label: '가구제작' },
  { path: '/admin/inquiry', label: '견적문의' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const isAdmin = location.pathname.startsWith('/admin');
  const menus = isAdmin ? adminMenus : publicMenus;
  const logoHref = isAdmin ? '/admin/home' : '/';

  const onLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to={logoHref} className={styles.logo} aria-label="홈으로 이동">
          <HomeLogo className={styles.logoSvg} aria-hidden="true" focusable="false" />
        </Link>

        <div className={styles.menu}>
          {/* ✅ 관리자일 때만 로그아웃 */}
          {isAdmin && (
            <span
              role="link"
              tabIndex={0}
              className={styles.logout}
              onClick={onLogout}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onLogout();
              }}
            >
              로그아웃
            </span>
          )}
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
