import httpClient from '@/core/http/httpClient';
import { Contact, CreateContactRequest, UpdateContactRequest, Customer } from '../types/contact.type';
import { ApiResponse, PageResponse } from '../../products/types/category.type';


export const contactApi = {
  getContacts: async (keyword = '', isPrimary?: boolean, isActive?: boolean, page = 1, size = 10): Promise<PageResponse<Contact>> => {
    const response = await httpClient.get<ApiResponse<PageResponse<Contact>>>('/api/v1/contacts', {
      params: { keyword, isPrimary, isActive, page, size }
    });
    return response.data.data;
  },

  getContactById: async (id: number): Promise<Contact> => {
    const response = await httpClient.get<ApiResponse<Contact>>(`/api/v1/contacts/${id}`);
    return response.data.data;
  },

  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const response = await httpClient.post<ApiResponse<Contact>>('/api/v1/contacts', data);
    return response.data.data;
  },

  updateContact: async (id: number, data: UpdateContactRequest): Promise<Contact> => {
    const response = await httpClient.put<ApiResponse<Contact>>(`/api/v1/contacts/${id}`, data);
    return response.data.data;
  },

  deleteContact: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/v1/contacts/${id}`);
  },

  bulkDeleteContacts: async (ids: number[]): Promise<void> => {
    await httpClient.delete('/api/v1/contacts/bulk', { data: ids });
  }
};

export const customerApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await httpClient.get<ApiResponse<PageResponse<Customer>>>('/api/v1/customers');
    return response.data.data.items;
  },
  
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await httpClient.post<ApiResponse<Customer>>('/api/v1/customers', data);
    return response.data.data;
  }
};
