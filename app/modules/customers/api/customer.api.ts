import httpClient from '@/core/http/httpClient';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../types/customer.type';
import { ApiResponse, PageResponse } from '../../products/types/category.type';


export const customerApi = {
  getCustomers: async (keyword = '', type = '', page = 1, size = 10): Promise<PageResponse<Customer>> => {
    const response = await httpClient.get<ApiResponse<PageResponse<Customer>>>('/api/customers', {
      params: { keyword, type, page, size }
    });
    
    return response.data.data;
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await httpClient.get<ApiResponse<Customer>>(`/api/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await httpClient.post<ApiResponse<Customer>>('/api/customers', data);
    return response.data.data;
  },

  updateCustomer: async (id: number, data: UpdateCustomerRequest): Promise<Customer> => {
    const response = await httpClient.put<ApiResponse<Customer>>(`/api/customers/${id}`, data);
    return response.data.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/customers/${id}`);
  },

  bulkDeleteCustomers: async (ids: number[]): Promise<void> => {
    await httpClient.delete('/api/customers/bulk', { data: ids });
  }
};
