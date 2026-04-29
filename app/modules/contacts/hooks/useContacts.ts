import useSWR from 'swr';
import { contactApi } from '../api/contact.api';

export const useContacts = (keyword = '', page = 1, size = 10, filters: { isPrimary?: boolean, isActive?: boolean } = {}) => {
  const { isPrimary, isActive } = filters;
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/contacts?keyword=${keyword}&isPrimary=${isPrimary ?? ""}&isActive=${isActive ?? ""}&page=${page}&size=${size}`,
    () => contactApi.getContacts(keyword, isPrimary, isActive, page, size)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate
  };
};

export const useContact = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/contacts/${id}` : null,
    () => contactApi.getContactById(id as number)
  );

  return {
    contact: data,
    isLoading,
    isError: error,
    mutate
  };
};
