import { useMemo, useState } from 'react';
import KycListContext from './KycListContext';
import type { ReactNode } from 'react';
import type { KycListContextType } from './KycListContext';
import useReadParams from '@/hooks/useReadParams';

function KycListContextProvider({ children }: { children: ReactNode }) {
  const params = useReadParams();
  const [kycStatus, setKycStatus] = useState<Array<string>>(params.kyc_status || []);
  const [kycBand, setKycBand] = useState<Array<string>>(params.kyc_band || []);
  const [country, setCountry] = useState<Array<string>>(params.country || []);
  const [duration, setDuration] = useState<Array<string>>(params.duration || []);
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
