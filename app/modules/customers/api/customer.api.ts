import axios from 'axios';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../types/customer.type';
import { ApiResponse, PageResponse } from '../../products/types/category.type';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerApi = {
  getCustomers: async (keyword = '', type = '', page = 1, size = 10): Promise<PageResponse<Customer>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Customer>>>('/api/v1/customers', {
      params: { keyword, type, page, size }
    });
    
    return response.data.data;
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/api/v1/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/api/v1/customers', data);
    return response.data.data;
  },

  updateCustomer: async (id: number, data: UpdateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/api/v1/customers/${id}`, data);
    return response.data.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/customers/${id}`);
  },

  bulkDeleteCustomers: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/api/v1/customers/bulk', { data: ids });
  }
};
