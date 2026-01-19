import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type UserListContextType = {
  kycStatus: Array<string>;
  setKycStatus: Dispatch<SetStateAction<Array<string>>>;
  accountStatus: Array<string>;
  setAccountStatus: Dispatch<SetStateAction<Array<string>>>;
  riskLevel: Array<string>;
  setRiskLevel: Dispatch<SetStateAction<Array<string>>>;
  country: Array<string>;
  setCountry: Dispatch<SetStateAction<Array<string>>>;
  joinedAt: Array<string>;
  setJoinedAt: Dispatch<SetStateAction<Array<string>>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
};

const UserListContext = createContext<UserListContextType | undefined>(undefined);

export default UserListContext;
