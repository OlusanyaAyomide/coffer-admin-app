import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type UserListContextType = {
  kycStatus: string[];
  setKycStatus: Dispatch<SetStateAction<string[]>>;
  accountStatus: string[];
  setAccountStatus: Dispatch<SetStateAction<string[]>>;
  riskLevel: string[];
  setRiskLevel: Dispatch<SetStateAction<string[]>>;
  country: string[];
  setCountry: Dispatch<SetStateAction<string[]>>;
  joinedAt: string[];
  setJoinedAt: Dispatch<SetStateAction<string[]>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
};

const UserListContext = createContext<UserListContextType | undefined>(undefined);

export default UserListContext;
