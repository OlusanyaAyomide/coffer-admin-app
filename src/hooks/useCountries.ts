import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

export type Country = {
  id: string;
  name: string;
  flag: string;
  iso_code_a2: string;
};

type CountriesResponse = {
  success: boolean;
  data: Array<Country>;
};

/** The public country catalog, used to target campaigns by country. */
export default function useCountries({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, isLoading } = useGetRequest<CountriesResponse, QueryError>({
    URL: '/countries',
    queryKey: ['countries'],
    enabled,
  });

  return {
    countries: data?.data ?? [],
    isCountriesLoading: isLoading,
  };
}
