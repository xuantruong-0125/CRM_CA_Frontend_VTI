import axios from 'axios';
import { Price, CreatePriceRequest, UpdatePriceRequest } from '../types/price.type';
import { ApiResponse, PageResponse } from '../types/category.type';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const priceApi = {
  getPrices: async (): Promise<Price[]> => {
    const response = await apiClient.get<ApiResponse<Price[]>>('/api/v1/prices');
    return response.data.data;
  },

  searchPrices: async (keyword?: string, page = 0, size = 15): Promise<PageResponse<Price>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Price>>>('/api/v1/prices/search', {
      params: { keyword, page, size }
    });
    return response.data.data;
  },

  updatePrice: async (id: number, data: UpdatePriceRequest): Promise<Price> => {
    const response = await apiClient.put<ApiResponse<Price>>(`/api/v1/prices/${id}`, data);
    return response.data.data;
  },
};
