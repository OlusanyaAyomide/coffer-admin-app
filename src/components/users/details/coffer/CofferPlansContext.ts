import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type CofferPlansContextType = {
  investmentStatus: string[];
  setInvestmentStatus: Dispatch<SetStateAction<string[]>>;
  startDate: string[];
  setStartDate: Dispatch<SetStateAction<string[]>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const CofferPlansContext = createContext<CofferPlansContextType | undefined>(undefined);

export default CofferPlansContext;
