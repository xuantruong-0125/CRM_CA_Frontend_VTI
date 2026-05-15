import { http } from "@/shared/api/http";
import type {
  ActivityResponseDTO,
  AttachmentResponseDTO,
  ContactResponseDTO,
  ContractResponseDTO,
  CreateCustomerDTO,
  CustomerAddressResponseDTO,
  CustomerListQuery,
  CustomerResponseDTO,
  FeedbackResponseDTO,
  InvoiceResponseDTO,
  OpportunityResponseDTO,
  PageResponse,
  QuoteResponseDTO,
  UpdateCustomerDTO,
} from "@/modules/customer/types/customer.types";

export const customerApi = {
  getCustomers: async (query: CustomerListQuery): Promise<PageResponse<CustomerResponseDTO>> => {
    const response = await http.get<PageResponse<CustomerResponseDTO>>("/api/customers", {
      params: query,
    });

    return response.data;
  },

  getCustomerById: async (id: number): Promise<CustomerResponseDTO> => {
    const response = await http.get<CustomerResponseDTO>(`/api/customers/${id}`);
    return response.data;
  },

  createCustomer: async (payload: CreateCustomerDTO): Promise<CustomerResponseDTO> => {
    const response = await http.post<CustomerResponseDTO>("/api/customers", payload);
    return response.data;
  },

  updateCustomer: async (id: number, payload: UpdateCustomerDTO): Promise<CustomerResponseDTO> => {
    const response = await http.put<CustomerResponseDTO>(`/api/customers/${id}`, payload);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await http.delete(`/api/customers/${id}`);
  },

  getCustomerCount: async (): Promise<number> => {
    const response = await http.get<number>("/api/customers/count");
    return response.data;
  },

  updateCustomerStatus: async (id: number, statusId: number): Promise<void> => {
    await http.patch(`/api/customers/${id}/status`, null, { params: { statusId } });
  },

  updateCustomerTier: async (id: number, tierId: number): Promise<void> => {
    await http.patch(`/api/customers/${id}/tier`, null, { params: { tierId } });
  },

  assignCustomerToUser: async (id: number, userId: number): Promise<void> => {
    await http.patch(`/api/customers/${id}/assign`, null, { params: { userId } });
  },

  getAddressesByCustomerId: async (customerId: number): Promise<CustomerAddressResponseDTO[]> => {
    const response = await http.get<CustomerAddressResponseDTO[]>(
      `/api/customer-addresses/customer/${customerId}`
    );

    return response.data;
  },

  getContactsByCustomerId: async (customerId: number): Promise<ContactResponseDTO[]> => {
    const response = await http.get<ContactResponseDTO[]>(`/api/contacts/customer/${customerId}`);
    return response.data;
  },

  getOpportunitiesByCustomerId: async (
    customerId: number
  ): Promise<PageResponse<OpportunityResponseDTO>> => {
    const response = await http.get<PageResponse<OpportunityResponseDTO>>(
      `/api/opportunities/customer/${customerId}`
    );

    return response.data;
  },

  getQuotesByCustomerId: async (customerId: number): Promise<PageResponse<QuoteResponseDTO>> => {
    const response = await http.get<PageResponse<QuoteResponseDTO>>(
      `/api/quotes/customer/${customerId}`
    );

    return response.data;
  },

  getContractsByCustomerId: async (customerId: number): Promise<PageResponse<ContractResponseDTO>> => {
    const response = await http.get<PageResponse<ContractResponseDTO>>(
      `/api/contracts/customer/${customerId}`
    );

    return response.data;
  },

  getInvoicesByCustomerId: async (customerId: number): Promise<PageResponse<InvoiceResponseDTO>> => {
    const response = await http.get<PageResponse<InvoiceResponseDTO>>(
      `/api/invoices/customer/${customerId}`
    );

    return response.data;
  },

  getActivitiesByCustomerId: async (customerId: number): Promise<PageResponse<ActivityResponseDTO>> => {
    const response = await http.get<PageResponse<ActivityResponseDTO>>(
      `/api/activities/customer/${customerId}`
    );

    return response.data;
  },

  getFeedbacksByCustomerId: async (customerId: number): Promise<PageResponse<FeedbackResponseDTO>> => {
    const response = await http.get<PageResponse<FeedbackResponseDTO>>(
      `/api/feedbacks/customer/${customerId}`
    );

    return response.data;
  },

  getAttachmentsByCustomerId: async (
    customerId: number
  ): Promise<PageResponse<AttachmentResponseDTO>> => {
    const response = await http.get<PageResponse<AttachmentResponseDTO>>(
      `/api/attachments/related-paginated/customer/${customerId}`
    );

    return response.data;
  },
};