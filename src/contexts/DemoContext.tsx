import { createContext, useContext, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  demoWarehouseId: string;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoWarehouseId: "",
});

export const useDemoMode = () => useContext(DemoContext);

interface DemoProviderProps {
  children: ReactNode;
  isDemoMode?: boolean;
  demoWarehouseId?: string;
}

export const DemoProvider = ({ 
  children, 
  isDemoMode = false,
  demoWarehouseId = ""
}: DemoProviderProps) => {
  return (
    <DemoContext.Provider value={{ isDemoMode, demoWarehouseId }}>
      {children}
    </DemoContext.Provider>
  );
};
