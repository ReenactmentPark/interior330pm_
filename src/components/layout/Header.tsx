import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import logo from '@/assets/icons/logo.jpg';

const menus = [
  { path: "/", label: "홈페이지" },
  { path: "/interior", label: "인테리어제작" },
  { path: "/furniture", label: "가구견적" },
  { path: "/inquiry", label: "견적문의" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* 왼쪽: 로고 */}
        <div className={styles.logo}>
          <img src={logo} alt="logo" />
        </div>

        {/* 오른쪽: 메뉴 */}
        <div className={styles.menu}>
          {menus.map(m => (
            <NavLink key={m.path} to={m.path}>
              {m.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}