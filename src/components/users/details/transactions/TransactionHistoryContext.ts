import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type TransactionHistoryContextType = {
  transactionType: string[];
  setTransactionType: Dispatch<SetStateAction<string[]>>;
  transactionStatus: string[];
  setTransactionStatus: Dispatch<SetStateAction<string[]>>;
  currency: string[];
  setCurrency: Dispatch<SetStateAction<string[]>>;
  duration: string[];
  setDuration: Dispatch<SetStateAction<string[]>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const TransactionHistoryContext = createContext<TransactionHistoryContextType | undefined>(undefined);

export default TransactionHistoryContext;
