import { useContext } from 'react';
import ActivityLogContext from './ActivityLogContext';

export default function useActivityLogContext() {
  const context = useContext(ActivityLogContext);
  if (context === undefined) {
    throw new Error('useActivityLogContext must be used within an ActivityLogContextProvider');
  }
  return context;
}
