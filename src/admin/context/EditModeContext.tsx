import { createContext, useContext } from 'react';

type EditModeValue = {
  enabled: boolean;
};

const EditModeContext = createContext<EditModeValue>({ enabled: false });

export function EditModeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return <EditModeContext.Provider value={{ enabled }}>{children}</EditModeContext.Provider>;
}

export function useEditMode() {
  return useContext(EditModeContext);
}
