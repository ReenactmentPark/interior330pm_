import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EditModeProvider } from '@/admin/context/EditModeContext';
import { EditDraftProvider } from '@/admin/context/EditDraftContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  return (
    <EditModeProvider enabled>
      <EditDraftProvider>
        <div className={styles.app}>
          <Header />
          <main className={styles.main}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </EditDraftProvider>
    </EditModeProvider>
  );
}
