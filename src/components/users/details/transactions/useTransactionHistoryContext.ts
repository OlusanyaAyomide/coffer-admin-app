import { useContext } from 'react';
import TransactionHistoryContext from './TransactionHistoryContext';

export default function useTransactionHistoryContext() {
  const context = useContext(TransactionHistoryContext);

  if (!context) {
    throw new Error('useTransactionHistoryContext must be used within TransactionHistoryContextProvider');
  }

  return context;
}
