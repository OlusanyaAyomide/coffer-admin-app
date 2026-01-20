import { useMemo, useState } from 'react';
import ActivityLogContext from './ActivityLogContext';
import type { ReactNode } from 'react';
import type { ActivityLogContextType } from './ActivityLogContext';

function ActivityLogContextProvider({ children }: { children: ReactNode }) {
  const [activityType, setActivityType] = useState<Array<string>>([]);
  const [duration, setDuration] = useState<Array<string>>([]);
  const [page, setPage] = useState<number>(1);

  const contextValue = useMemo<ActivityLogContextType>(() => ({
    activityType,
    setActivityType,
    duration,
    setDuration,
    page,
    setPage,
  }), [activityType, duration, page]);

  return (
    <ActivityLogContext.Provider value={contextValue}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export default ActivityLogContextProvider;
