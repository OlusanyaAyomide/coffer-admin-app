import { useMemo, useState } from 'react';
import UserListContext from './UserListContext';
import type { ReactNode} from 'react';
import type { UserListContextType } from './UserListContext';
import useReadParams from '@/hooks/useReadParams';

function UserListContextProvider({ children }: { children: ReactNode }) {

  const params = useReadParams();

  const [kycStatus, setKycStatus] = useState<Array<string>>(params.kyc_status || []);
  const [accountStatus, setAccountStatus] = useState<Array<string>>(params.account_status || []);
  const [riskLevel, setRiskLevel] = useState<Array<string>>(params.risk_level || []);
  const [country, setCountry] = useState<Array<string>>(params.country || []);
  const [joinedAt, setJoinedAt] = useState<Array<string>>(params.joined_at || []);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const contextValue = useMemo<UserListContextType>(() => ({
    kycStatus,
    setKycStatus,
    accountStatus,
    setAccountStatus,
    riskLevel,
    setRiskLevel,
    country,
    setCountry,
    joinedAt,
    setJoinedAt,
    page,
    setPage,
    searchTerm,
    setSearchTerm,
  }), [
    kycStatus, accountStatus, riskLevel, country, joinedAt,
    page, searchTerm,
  ]);

  return (
    <UserListContext.Provider value={contextValue}>
      {children}
    </UserListContext.Provider>
  );
}

export default UserListContextProvider;
