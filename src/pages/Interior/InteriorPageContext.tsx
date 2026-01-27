import { createContext, useContext } from 'react';
import type { InteriorPageViewModel } from '@/types/page';

const InteriorPageContext = createContext<InteriorPageViewModel | null>(null);

export function InteriorPageProvider({
  value,
  children,
}: {
  value: InteriorPageViewModel;
  children: React.ReactNode;
}) {
  return <InteriorPageContext.Provider value={value}>{children}</InteriorPageContext.Provider>;
}

export function useInteriorPage() {
  return useContext(InteriorPageContext);
}
