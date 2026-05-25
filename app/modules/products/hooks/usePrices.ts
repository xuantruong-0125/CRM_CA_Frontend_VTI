import useSWR from 'swr';
import { priceApi } from '../api/price.api';

export const useSearchPrices = (keyword?: string, page = 0, size = 15) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/prices/search?keyword=${keyword || ''}&page=${page}&size=${size}`,
    () => priceApi.searchPrices(keyword, page, size)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate
  };
};
