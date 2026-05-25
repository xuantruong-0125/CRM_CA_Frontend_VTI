import { http } from "@/shared/api/http";
import type {
  AssigneeMetadataQuery,
  ConvertLeadRequest,
  ConvertLeadResponse,
  CreateLeadRequest,
  CreateLeadActivityRequest,
  CreateLeadTaskRequest,
  LeadActivityResponse,
  LeadActivityStatisticsResponse,
  LeadListQuery,
  LeadPageResponse,
  LeadReferenceCatalogResponse,
  LeadResponse,
  LeadTaskResponse,
  MetadataPageResponse,
  OrganizationMetadataQuery,
  ProductMetadataQuery,
  LeadReferenceOptionResponse,
  SearchLeadRequest,
  UpdateLeadRequest,
  UpdateLeadActivityRequest,
} from "@/modules/lead/types/lead.types";

export const leadApi = {
  getReferences: async (): Promise<LeadReferenceCatalogResponse> => {
    const response = await http.get<LeadReferenceCatalogResponse>(
      "/api/leads/references"
    );
    return response.data;
  },

  getAssigneeMetadata: async (
    query: AssigneeMetadataQuery
  ): Promise<MetadataPageResponse> => {
    const response = await http.get<MetadataPageResponse>(
      "/api/leads/metadata/assignees",
      { params: query }
    );
    return response.data;
  },

  getProductMetadata: async (
    query: ProductMetadataQuery
  ): Promise<MetadataPageResponse> => {
    const response = await http.get<MetadataPageResponse>(
      "/api/leads/metadata/products",
      { params: query }
    );
    return response.data;
  },

  getProvinceMetadata: async (): Promise<LeadReferenceOptionResponse[]> => {
    const response = await http.get<LeadReferenceCatalogResponse>(
      "/api/leads/references"
    );
    return response.data.provinces || [];
  },

  getOrganizationMetadata: async (
    query: OrganizationMetadataQuery = {}
  ): Promise<MetadataPageResponse> => {
    const response = await http.get<MetadataPageResponse>(
      "/api/leads/metadata/organizations",
      { params: query }
    );
    return response.data;
  },

  createLead: async (payload: CreateLeadRequest): Promise<LeadResponse> => {
    const response = await http.post<LeadResponse>("/api/leads", payload);
    return response.data;
  },

  getLeadById: async (id: number): Promise<LeadResponse> => {
    const response = await http.get<LeadResponse>(`/api/leads/${id}`);
    return response.data;
  },

  updateLead: async (
    id: number,
    payload: UpdateLeadRequest
  ): Promise<LeadResponse> => {
    const response = await http.put<LeadResponse>(`/api/leads/${id}`, payload);
    return response.data;
  },

  deleteLead: async (id: number): Promise<void> => {
    await http.delete(`/api/leads/${id}`);
  },

  getLeads: async (
    query: LeadListQuery
  ): Promise<LeadPageResponse<LeadResponse>> => {
    const response = await http.get<LeadPageResponse<LeadResponse>>(
      "/api/leads",
      { params: query }
    );
    return response.data;
  },

  searchLeads: async (
    query: SearchLeadRequest
  ): Promise<LeadPageResponse<LeadResponse>> => {
    const response = await http.get<LeadPageResponse<LeadResponse>>(
      "/api/leads/search",
      { params: query }
    );
    return response.data;
  },

  convertLead: async (
    id: number,
    payload: ConvertLeadRequest
  ): Promise<ConvertLeadResponse> => {
    const response = await http.post<ConvertLeadResponse>(
      `/api/leads/${id}/convert`,
      payload
    );
    return response.data;
  },

  getActivities: async (leadId: number): Promise<LeadActivityResponse[]> => {
    const response = await http.get<LeadPageResponse<LeadActivityResponse>>(
      "/api/v1/activities",
      {
        params: {
          relatedToType: "LEAD",
          relatedToId: leadId,
          page: 0,
          size: 100,
        },
      }
    );
    return response.data.content || [];
  },

  getActivityStatistics: async (
    leadId: number
  ): Promise<LeadActivityStatisticsResponse> => {
    const response = await http.get<LeadActivityStatisticsResponse>(
      `/api/leads/${leadId}/activities/statistics`
    );
    return response.data;
  },

  getLeadTasks: async (
    leadId: number,
    query: LeadListQuery = {}
  ): Promise<LeadTaskResponse[]> => {
    const response = await http.get<LeadPageResponse<LeadTaskResponse> | LeadTaskResponse[]>(
      `/api/leads/${leadId}/tasks`,
      { params: query }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.content || [];
  },

  createActivity: async (
    leadId: number,
    payload: CreateLeadActivityRequest
  ): Promise<LeadActivityResponse> => {
    const response = await http.post<LeadActivityResponse>(
      "/api/v1/activities",
      {
        ...payload,
        relatedToType: "LEAD",
        relatedToId: leadId,
      }
    );
    return response.data;
  },

  updateActivity: async (
    leadId: number,
    activityId: number,
    payload: UpdateLeadActivityRequest
  ): Promise<LeadActivityResponse> => {
    const response = await http.put<LeadActivityResponse>(
      `/api/v1/activities/${activityId}`,
      {
        ...payload,
        relatedToType: "LEAD",
        relatedToId: leadId,
      }
    );
    return response.data;
  },

  createLeadTask: async (
    leadId: number,
    payload: CreateLeadTaskRequest
  ): Promise<LeadTaskResponse> => {
    const response = await http.post<LeadTaskResponse>(
      `/api/v1/tasks`,
      payload
    );
    return response.data;
  },

  updateLeadTask: async (
    leadId: number,
    taskId: number,
    payload: CreateLeadTaskRequest
  ): Promise<LeadTaskResponse> => {
    const response = await http.put<LeadTaskResponse>(
      `/api/leads/${leadId}/tasks/${taskId}`,
      payload
    );
    return response.data;
  },
};
