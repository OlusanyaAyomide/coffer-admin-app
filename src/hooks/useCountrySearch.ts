import { useState } from 'react';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type CountrySearchItem = {
  label: string;
  value: string;
  flag: string;
};

type CountrySearchResponse = {
  success: boolean;
  data: Array<CountrySearchItem>;
};

export default function useCountrySearch() {
  const [countrySearchResult, setCountrySearchResult] = useState<string>('');

  const trimmedSearchTerm = countrySearchResult.trim();

  const { data, isError, isLoading } = useGetRequest<CountrySearchResponse, QueryError>({
    URL: '/admin/customer/quick-search/countries',
    queryKey: ['country-search', trimmedSearchTerm],
    enabled: true,
    params: trimmedSearchTerm.length > 0 ? { search_term: trimmedSearchTerm } : undefined,
  });

  const countrySuggestions = data?.data
    ? data.data.map((country) => ({
      label: country.label,
      value: country.value,
      image_url: country.flag,
    }))
    : [];

  return {
    countrySuggestions,
    setCountrySearchResult,
    isCountrySearchError: isError,
    isCountrySearchLoading: isLoading,
  };
}
