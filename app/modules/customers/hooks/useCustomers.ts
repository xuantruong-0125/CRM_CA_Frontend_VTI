import useSWR from 'swr';
import { customerApi } from '../api/customer.api';

export const useCustomers = (keyword = '', page = 1, size = 10, filters: { type?: string } = {}) => {
  const { type } = filters;
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/customers?keyword=${keyword}&type=${type ?? ""}&page=${page}&size=${size}`,
    () => customerApi.getCustomers(keyword, type, page, size)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate
  };
};

export const useCustomer = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/customers/${id}` : null,
    () => customerApi.getCustomerById(id as number)
  );

  return {
    customer: data,
    isLoading,
    isError: error,
    mutate
  };
};
