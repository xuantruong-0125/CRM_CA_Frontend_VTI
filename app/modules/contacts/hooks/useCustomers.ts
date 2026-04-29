import useSWR from 'swr';
import { customerApi } from '../api/contact.api';

export const useCustomers = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/customers',
    () => customerApi.getCustomers()
  );

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate
  };
};
