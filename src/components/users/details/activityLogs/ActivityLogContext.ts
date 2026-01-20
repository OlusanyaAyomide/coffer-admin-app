import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type ActivityLogContextType = {
  activityType: Array<string>;
  setActivityType: Dispatch<SetStateAction<Array<string>>>;
  duration: Array<string>;
  setDuration: Dispatch<SetStateAction<Array<string>>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export default ActivityLogContext;
