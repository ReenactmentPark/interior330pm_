import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './AdminPublicLayout.module.css';

export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
