import axios from 'axios';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product.type';
import { ApiResponse, PageResponse } from '../types/category.type';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Tuỳ chỉnh baseURL theo Backend Spring Boot của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/api/v1/products');
    return response.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/v1/products/${id}`);
    return response.data.data;
  },

  searchProducts: async (
    keyword?: string, 
    page = 0, 
    size = 15,
    categoryId?: number,
    status?: string,
    minPrice?: number,
    maxPrice?: number
  ): Promise<PageResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Product>>>('/api/v1/products/search', {
      params: { keyword, page, size, categoryId, status, minPrice, maxPrice }
    });
    return response.data.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/api/v1/products', data);
    return response.data.data;
  },

  updateProduct: async (id: number, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/api/v1/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/products/${id}`);
  },
};
