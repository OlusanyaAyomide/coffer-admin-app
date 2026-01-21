import { useContext } from 'react';
import KycListContext from './KycListContext';

export default function useKycListContext() {
  const context = useContext(KycListContext);
  if (context === undefined) {
    throw new Error('useKycListContext must be used within a KycListContextProvider');
  }
  return context;
}
