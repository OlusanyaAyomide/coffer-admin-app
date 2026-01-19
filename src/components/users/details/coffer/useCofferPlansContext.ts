import { useContext } from 'react';
import CofferPlansContext from './CofferPlansContext';

export default function useCofferPlansContext() {
  const context = useContext(CofferPlansContext);

  if (!context) {
    throw new Error('useCofferPlansContext must be used within CofferPlansContextProvider');
  }

  return context;
}
