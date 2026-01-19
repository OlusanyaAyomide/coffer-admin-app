import { useMemo, useState } from 'react';
import TransactionHistoryContext from './TransactionHistoryContext';
import type { ReactNode} from 'react';
import type { TransactionHistoryContextType } from './TransactionHistoryContext';

function TransactionHistoryContextProvider({ children }: { children: ReactNode }) {
  const [transactionType, setTransactionType] = useState<Array<string>>([]);
  const [transactionStatus, setTransactionStatus] = useState<Array<string>>([]);
  const [currency, setCurrency] = useState<Array<string>>([]);
  const [duration, setDuration] = useState<Array<string>>([]);
  const [page, setPage] = useState<number>(1);

  const contextValue = useMemo<TransactionHistoryContextType>(() => ({
    transactionType,
    setTransactionType,
    transactionStatus,
    setTransactionStatus,
    currency,
    setCurrency,
    duration,
    setDuration,
    page,
    setPage,
  }), [transactionType, transactionStatus, currency, duration, page]);

  return (
    <TransactionHistoryContext.Provider value={contextValue}>
      {children}
    </TransactionHistoryContext.Provider>
  );
}

export default TransactionHistoryContextProvider;
