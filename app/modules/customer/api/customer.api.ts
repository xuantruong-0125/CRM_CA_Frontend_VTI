import { http } from "@/shared/api/http";
import type {
  ActivityResponseDTO,
  AttachmentResponseDTO,
  CreateActivityDTO,
  CreateContactDTO,
  ContactResponseDTO,
  ContractResponseDTO,
  CreateCustomerDTO,
  CustomerAddressResponseDTO,
  CustomerListQuery,
  CustomerSaleUserResponseDTO,
  CustomerResponseDTO,
  FeedbackResponseDTO,
  InvoiceResponseDTO,
  OpportunityResponseDTO,
  PageResponse,
  QuoteResponseDTO,
  UpdateCustomerDTO,
} from "@/modules/customer/types/customer.types";

type LeadAssigneeResponseDTO = {
  id: number;
  code?: string;
  name?: string;
};

type LeadAssigneesResponse =
  | { content?: LeadAssigneeResponseDTO[] }
  | LeadAssigneeResponseDTO[]
  | LeadAssigneeResponseDTO;

export const customerApi = {
  getCustomers: async (query: CustomerListQuery): Promise<PageResponse<CustomerResponseDTO>> => {
    const STATUS_ID_MAP: Record<string, number> = {
      CARING: 1,
      PAUSED: 2,
      BLACKLIST: 3,
      OTHER: 4,
    };

    const TIER_ID_MAP: Record<string, number> = {
      SILVER: 1,
      GOLD: 2,
      DIAMOND: 3,
    };

    const normalizedQ = query.q?.trim();

    const params: Record<string, unknown> = {
      page: query.page,
      size: query.size,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    };

    if (query.customerType) {
      params.type = query.customerType;
    }

    if (query.status) {
      const statusId = STATUS_ID_MAP[query.status as string];
      if (typeof statusId === "number") {
        params.statusId = statusId;
      }
    }

    if (query.tier) {
      const tierId = TIER_ID_MAP[query.tier as string];
      if (typeof tierId === "number") {
        params.tierId = tierId;
      }
    }

    if (normalizedQ) {
      // New BE supports a single `keyword` parameter that searches across
      // name, code, tax, email, phone. Use it for the search bar.
      params.keyword = normalizedQ;
    }

    const response = await http.get<PageResponse<CustomerResponseDTO>>("/api/customers/search", {
      params,
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

  getSalesUsers: async (): Promise<CustomerSaleUserResponseDTO[]> => {
    const response = await http.get<LeadAssigneesResponse>("/api/leads/metadata/assignees");

    const normalizeAssignee = (assignee: LeadAssigneeResponseDTO): CustomerSaleUserResponseDTO => ({
      id: assignee.id,
      username: assignee.code ?? `user-${assignee.id}`,
      email: "",
      fullName: assignee.name ?? assignee.code ?? `User #${assignee.id}`,
      roleId: 0,
      organizationId: 0,
      status: "ACTIVE",
      lastLogin: null,
    });

    if (Array.isArray(response.data)) {
      return response.data.map(normalizeAssignee);
    }

    if (response.data && typeof response.data === "object" && "content" in response.data) {
      return (response.data.content ?? []).map(normalizeAssignee);
    }

    return response.data ? [normalizeAssignee(response.data as LeadAssigneeResponseDTO)] : [];
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

  createCustomerAddress: async (payload: {
    customerId: number;
    addressType: string;
    fullAddress: string;
    provinceId?: number;
    isPrimary?: boolean;
  }): Promise<CustomerAddressResponseDTO> => {
    const response = await http.post<CustomerAddressResponseDTO>(`/api/customer-addresses`, payload);
    return response.data;
  },

  updateCustomerAddress: async (
    id: number,
    payload: {
      customerId: number;
      addressType: string;
      fullAddress: string;
      provinceId?: number;
      isPrimary?: boolean;
    }
  ): Promise<CustomerAddressResponseDTO> => {
    const response = await http.put<CustomerAddressResponseDTO>(`/api/customer-addresses/${id}`, payload);
    return response.data;
  },

  deleteCustomerAddress: async (id: number): Promise<void> => {
    await http.delete(`/api/customer-addresses/${id}`);
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

  // Create contact for a customer
  createContact: async (payload: CreateContactDTO): Promise<ContactResponseDTO> => {
    const response = await http.post<ContactResponseDTO>(`/api/contacts`, payload);
    return response.data;
  },

  updateContact: async (id: number, payload: CreateContactDTO): Promise<ContactResponseDTO> => {
    const response = await http.put<ContactResponseDTO>(`/api/v1/contacts/${id}`, payload);
    return response.data;
  },

  // Create activity (log) related to a customer
  createActivity: async (payload: CreateActivityDTO): Promise<ActivityResponseDTO> => {
    const response = await http.post<ActivityResponseDTO>(`/api/activities`, payload);
    return response.data;
  },

  updateActivity: async (id: number, payload: CreateActivityDTO): Promise<ActivityResponseDTO> => {
    const response = await http.put<ActivityResponseDTO>(`/api/v1/activities/${id}`, payload);
    return response.data;
  },

  // Upload attachment (multipart/form-data)
  uploadAttachment: async (formData: FormData): Promise<AttachmentResponseDTO> => {
    const response = await http.post<AttachmentResponseDTO>(`/api/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },
};