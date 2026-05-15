import { http } from "@/shared/api/http";
import type {
  AssigneeMetadataQuery,
  ConvertLeadRequest,
  ConvertLeadResponse,
  CreateLeadRequest,
  CreateLeadActivityRequest,
  CreateLeadMeetingRequest,
  LeadActivityResponse,
  LeadActivityStatisticsResponse,
  LeadListQuery,
  LeadPageResponse,
  LeadReferenceCatalogResponse,
  LeadResponse,
  LeadMeetingTaskResponse,
  MetadataPageResponse,
  OrganizationMetadataItem,
  OrganizationMetadataQuery,
  ProductMetadataQuery,
  ProvinceMetadataQuery,
  SearchLeadRequest,
  UpdateLeadRequest,
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

  getProvinceMetadata: async (
    query: ProvinceMetadataQuery
  ): Promise<MetadataPageResponse> => {
    const response = await http.get<MetadataPageResponse>(
      "/api/leads/metadata/provinces",
      { params: query }
    );
    return response.data;
  },

  getOrganizationMetadata: async (
    query: OrganizationMetadataQuery = {}
  ): Promise<MetadataPageResponse | OrganizationMetadataItem[]> => {
    const response = await http.get<MetadataPageResponse | OrganizationMetadataItem[]>(
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
    const params = {
      ...query,
      // Backward compatibility: some BE implementations parse `status`
      // instead of `statusId` for search filtering.
      status: query.statusId,
    };

    const response = await http.get<LeadPageResponse<LeadResponse>>(
      "/api/leads/search",
      { params }
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
    const response = await http.get<LeadActivityResponse[]>(
      `/api/leads/${leadId}/activities`
    );
    return response.data;
  },

  getActivityStatistics: async (
    leadId: number
  ): Promise<LeadActivityStatisticsResponse> => {
    const response = await http.get<LeadActivityStatisticsResponse>(
      `/api/leads/${leadId}/activities/statistics`
    );
    return response.data;
  },

  createActivity: async (
    leadId: number,
    payload: CreateLeadActivityRequest
  ): Promise<LeadActivityResponse> => {
    const response = await http.post<LeadActivityResponse>(
      `/api/leads/${leadId}/activities`,
      payload
    );
    return response.data;
  },

  updateActivity: async (
    leadId: number,
    activityId: number,
    payload: CreateLeadActivityRequest
  ): Promise<LeadActivityResponse> => {
    const response = await http.put<LeadActivityResponse>(
      `/api/leads/${leadId}/activities/${activityId}`,
      payload
    );
    return response.data;
  },

  createMeeting: async (
    leadId: number,
    payload: CreateLeadMeetingRequest
  ): Promise<LeadMeetingTaskResponse> => {
    const response = await http.post<LeadMeetingTaskResponse>(
      `/api/leads/${leadId}/meetings`,
      payload
    );
    return response.data;
  },

  updateMeeting: async (
    leadId: number,
    meetingId: number,
    payload: CreateLeadMeetingRequest
  ): Promise<LeadMeetingTaskResponse> => {
    const response = await http.put<LeadMeetingTaskResponse>(
      `/api/leads/${leadId}/meetings/${meetingId}`,
      payload
    );
    return response.data;
  },
};
