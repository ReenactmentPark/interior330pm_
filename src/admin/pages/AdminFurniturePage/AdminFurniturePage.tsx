import Furniture from '@/pages/Furniture/Furniture';
import { EditModeProvider } from '@/admin/context/EditModeContext';
import { EditDraftProvider } from '@/admin/context/EditDraftContext';

export default function AdminFurniturePage() {
  return (
    <EditModeProvider enabled>
      <EditDraftProvider>
        <Furniture />
      </EditDraftProvider>
    </EditModeProvider>
  );
}
