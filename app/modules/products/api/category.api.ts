import axios from 'axios';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, ApiResponse, PageResponse } from '../types/category.type';

// Cấu hình axios instance nếu cần
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Tuỳ chỉnh baseURL theo Backend Spring Boot của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/api/v1/categories');
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/api/v1/categories/${id}`);
    return response.data.data;
  },

  searchCategories: async (keyword?: string, page = 0, size = 10): Promise<PageResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Category>>>('/api/v1/categories/search', {
      params: { keyword, page, size }
    });
    return response.data.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/api/v1/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/categories/${id}`);
  },

  deleteBulk: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/api/v1/categories/bulk', { data: ids });
  }
};
