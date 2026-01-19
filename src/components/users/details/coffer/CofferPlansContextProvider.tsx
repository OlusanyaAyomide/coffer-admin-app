import { ReactNode, useMemo, useState } from 'react';
import CofferPlansContext, { CofferPlansContextType } from './CofferPlansContext';

function CofferPlansContextProvider({ children }: { children: ReactNode }) {
  const [investmentStatus, setInvestmentStatus] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);

  const contextValue = useMemo<CofferPlansContextType>(() => ({
    investmentStatus,
    setInvestmentStatus,
    startDate,
    setStartDate,
    page,
    setPage,
  }), [investmentStatus, startDate, page]);

  return (
    <CofferPlansContext.Provider value={contextValue}>
      {children}
    </CofferPlansContext.Provider>
  );
}

export default CofferPlansContextProvider;
