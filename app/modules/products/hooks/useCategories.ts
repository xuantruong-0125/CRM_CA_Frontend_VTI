import useSWR from 'swr';
import { categoryApi } from '../api/category.api';

export const useCategories = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/v1/categories', categoryApi.getCategories);

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useCategory = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/categories/${id}` : null,
    () => categoryApi.getCategoryById(id as number)
  );

  return {
    category: data,
    isLoading,
    isError: error,
    mutate
  };
};

export const useSearchCategories = (keyword?: string, page = 0, size = 10) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/categories/search?keyword=${keyword || ''}&page=${page}&size=${size}`,
    () => categoryApi.searchCategories(keyword, page, size)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate
  };
};
