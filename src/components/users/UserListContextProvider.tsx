import { ReactNode, useMemo, useState } from 'react';
import UserListContext, { UserListContextType } from './UserListContext';

function UserListContextProvider({ children }: { children: ReactNode }) {
  const [kycStatus, setKycStatus] = useState<string[]>([]);
  const [accountStatus, setAccountStatus] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<string[]>([]);
  const [country, setCountry] = useState<string[]>([]);
  const [joinedAt, setJoinedAt] = useState<string[]>([]);
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
