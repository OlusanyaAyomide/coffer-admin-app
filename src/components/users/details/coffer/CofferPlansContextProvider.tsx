import { useMemo, useState } from 'react';
import CofferPlansContext from './CofferPlansContext';
import type { ReactNode} from 'react';
import type { CofferPlansContextType } from './CofferPlansContext';

function CofferPlansContextProvider({ children }: { children: ReactNode }) {
  const [investmentStatus, setInvestmentStatus] = useState<Array<string>>([]);
  const [startDate, setStartDate] = useState<Array<string>>([]);
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
