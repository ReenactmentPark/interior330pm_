import Interior from '@/pages/Interior/Interior';
import { EditModeProvider } from '@/admin/context/EditModeContext';
import { EditDraftProvider } from '@/admin/context/EditDraftContext';

export default function AdminInteriorPage() {
  return (
    <EditModeProvider enabled>
      <EditDraftProvider>
        <Interior />
      </EditDraftProvider>
    </EditModeProvider>
  );
}
