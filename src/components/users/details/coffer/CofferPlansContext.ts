import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type CofferPlansContextType = {
  investmentStatus: Array<string>;
  setInvestmentStatus: Dispatch<SetStateAction<Array<string>>>;
  startDate: Array<string>;
  setStartDate: Dispatch<SetStateAction<Array<string>>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const CofferPlansContext = createContext<CofferPlansContextType | undefined>(undefined);

export default CofferPlansContext;
