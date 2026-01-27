import { createContext, useContext } from 'react';
import type { FurniturePageViewModel } from '@/types/page';

const FurniturePageContext = createContext<FurniturePageViewModel | null>(null);

export function FurniturePageProvider({
  value,
  children,
}: {
  value: FurniturePageViewModel;
  children: React.ReactNode;
}) {
  return <FurniturePageContext.Provider value={value}>{children}</FurniturePageContext.Provider>;
}

export function useFurniturePage() {
  return useContext(FurniturePageContext);
}
