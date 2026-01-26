'use client';

import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

const useFilterSearchParam = (key?: string) => {
  const navigate = useNavigate();
  // We keep useSearch to ensure the hook re-renders when params change
  const search = useSearch({ strict: false });

  const filterKey = key || '_';

  const setParam = useCallback(
    (values: Array<string>) => {
      // To bypass the 'never' type error, we cast the functional update 
      // or the navigate call itself.
      navigate({
        search: (prev: any): any => {
          const newSearch = { ...prev };

          if (values.length > 0) {
            newSearch[filterKey] = values.join(',');
          } else {
            delete newSearch[filterKey];
          }

          return newSearch;
        },
        replace: true,
      } as any);
    },
    [filterKey, navigate],
  );

  const resetParams = useCallback(() => {
    // 1. Get a snapshot of the current search

    // 3. Force the navigation with the new object
    navigate({
      search: {},
      replace: true,
    } as any);
  }, [filterKey, navigate, search]);

  return { setParam, resetParams, currentParams: (search as any)?.[filterKey] };
};

export default useFilterSearchParam;