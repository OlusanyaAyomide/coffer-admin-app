import { ReactNode, useMemo, useState } from 'react';
import UserListContext, { UserListContextType } from './UserListContext';
import useReadParams from '@/hooks/useReadParams';

function UserListContextProvider({ children }: { children: ReactNode }) {

  const params = useReadParams();

  const [kycStatus, setKycStatus] = useState<string[]>(params.kyc_status || []);
  const [accountStatus, setAccountStatus] = useState<string[]>(params.account_status || []);
  const [riskLevel, setRiskLevel] = useState<string[]>(params.risk_level || []);
  const [country, setCountry] = useState<string[]>(params.country || []);
  const [joinedAt, setJoinedAt] = useState<string[]>(params.joined_at || []);
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
