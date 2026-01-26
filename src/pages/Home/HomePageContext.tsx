import { createContext, useContext } from 'react';
import type { HomePageViewModel } from '@/types/page';

const HomePageContext = createContext<HomePageViewModel | null>(null);

export function HomePageProvider({
  value,
  children,
}: {
  value: HomePageViewModel;
  children: React.ReactNode;
}) {
  return <HomePageContext.Provider value={value}>{children}</HomePageContext.Provider>;
}

export function useHomePage() {
  return useContext(HomePageContext);
}
