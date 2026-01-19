import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type TransactionHistoryContextType = {
  transactionType: Array<string>;
  setTransactionType: Dispatch<SetStateAction<Array<string>>>;
  transactionStatus: Array<string>;
  setTransactionStatus: Dispatch<SetStateAction<Array<string>>>;
  currency: Array<string>;
  setCurrency: Dispatch<SetStateAction<Array<string>>>;
  duration: Array<string>;
  setDuration: Dispatch<SetStateAction<Array<string>>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const TransactionHistoryContext = createContext<TransactionHistoryContextType | undefined>(undefined);

export default TransactionHistoryContext;
