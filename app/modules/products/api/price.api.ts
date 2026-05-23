import httpClient from '@/core/http/httpClient';
import { Price, CreatePriceRequest, UpdatePriceRequest } from '../types/price.type';
import { ApiResponse, PageResponse } from '../types/category.type';


export const priceApi = {
  getPrices: async (): Promise<Price[]> => {
    const response = await httpClient.get<ApiResponse<Price[]>>('/api/v1/prices');
    return response.data.data;
  },

  searchPrices: async (keyword?: string, page = 0, size = 15): Promise<PageResponse<Price>> => {
    const response = await httpClient.get<ApiResponse<PageResponse<Price>>>('/api/v1/prices/search', {
      params: { keyword, page, size }
    });
    return response.data.data;
  },

  updatePrice: async (id: number, data: UpdatePriceRequest): Promise<Price> => {
    const response = await httpClient.put<ApiResponse<Price>>(`/api/v1/prices/${id}`, data);
    return response.data.data;
  },

  createPrice: async (data: CreatePriceRequest): Promise<Price> => {
    const response = await httpClient.post<ApiResponse<Price>>('/api/v1/prices', data);
    return response.data.data;
  },
};
