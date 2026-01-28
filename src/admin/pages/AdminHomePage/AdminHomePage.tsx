import { EditModeProvider } from '@/admin/context/EditModeContext';
import { EditDraftProvider } from '@/admin/context/EditDraftContext';
import AdminPublicLayout from '@/admin/components/AdminPublicLayout/AdminPublicLayout';

import Home from '@/pages/Home/Home';

export default function AdminHomePage() {
  return (
    <EditModeProvider enabled>
      <EditDraftProvider>
        <AdminPublicLayout>
          <Home />
        </AdminPublicLayout>
      </EditDraftProvider>
    </EditModeProvider>
  );
}
