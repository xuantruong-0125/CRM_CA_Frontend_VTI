import httpClient from '@/core/http/httpClient';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, ApiResponse, PageResponse } from '../types/category.type';


export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await httpClient.get<ApiResponse<Category[]>>('/api/v1/categories');
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await httpClient.get<ApiResponse<Category>>(`/api/v1/categories/${id}`);
    return response.data.data;
  },

  searchCategories: async (keyword?: string, page = 0, size = 10): Promise<PageResponse<Category>> => {
    const response = await httpClient.get<ApiResponse<PageResponse<Category>>>('/api/v1/categories/search', {
      params: { keyword, page, size }
    });
    return response.data.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await httpClient.post<ApiResponse<Category>>('/api/v1/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await httpClient.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/v1/categories/${id}`);
  },

  deleteBulk: async (ids: number[]): Promise<void> => {
    await httpClient.delete('/api/v1/categories/bulk', { data: ids });
  }
};
