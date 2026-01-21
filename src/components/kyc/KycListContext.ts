import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type KycListContextType = {
  kycStatus: Array<string>;
  setKycStatus: Dispatch<SetStateAction<Array<string>>>;
  kycBand: Array<string>;
  setKycBand: Dispatch<SetStateAction<Array<string>>>;
  country: Array<string>;
  setCountry: Dispatch<SetStateAction<Array<string>>>;
  duration: Array<string>;
  setDuration: Dispatch<SetStateAction<Array<string>>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const KycListContext = createContext<KycListContextType | undefined>(undefined);

export default KycListContext;
