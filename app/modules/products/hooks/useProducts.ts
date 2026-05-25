import useSWR from 'swr';
import { productApi } from '../api/product.api';

export const useSearchProducts = (keyword?: string, page = 0, size = 15, filters: any = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/products/search?keyword=${keyword || ""}&page=${page}&size=${size}&categoryId=${filters.categoryId || ""}&status=${filters.status || ""}&minPrice=${filters.minPrice || ""}&maxPrice=${filters.maxPrice || ""}`,
    () => productApi.searchProducts(
      keyword, 
      page, 
      size, 
      filters.categoryId, 
      filters.status, 
      filters.minPrice, 
      filters.maxPrice
    )
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate
  };
};

export const useProduct = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/products/${id}` : null,
    () => productApi.getProductById(id as number)
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate
  };
};
