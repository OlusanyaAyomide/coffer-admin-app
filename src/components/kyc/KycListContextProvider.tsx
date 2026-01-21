import { useMemo, useState } from 'react';
import KycListContext from './KycListContext';
import type { ReactNode } from 'react';
import type { KycListContextType } from './KycListContext';

function KycListContextProvider({ children }: { children: ReactNode }) {
  const [kycStatus, setKycStatus] = useState<Array<string>>([]);
  const [kycBand, setKycBand] = useState<Array<string>>([]);
  const [country, setCountry] = useState<Array<string>>([]);
  const [duration, setDuration] = useState<Array<string>>([]);
  const [page, setPage] = useState<number>(1);

  const contextValue = useMemo<KycListContextType>(() => ({
    kycStatus,
    setKycStatus,
    kycBand,
    setKycBand,
    country,
    setCountry,
    duration,
    setDuration,
    page,
    setPage,
  }), [kycStatus, kycBand, country, duration, page]);

  return (
    <KycListContext.Provider value={contextValue}>
      {children}
    </KycListContext.Provider>
  );
}

export default KycListContextProvider;
