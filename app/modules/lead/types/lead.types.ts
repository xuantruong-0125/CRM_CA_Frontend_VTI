export type ISODateTimeString = string;

export type SortDir = "asc" | "desc";

export type LeadListQuery = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: SortDir;
};

export type SearchLeadRequest = LeadListQuery & {
  provinceId?: number;
  organizationId?: number;
  phone?: string;
  email?: string;
  statusId?: number;
  sourceId?: number;
};

export type CreateLeadRequest = {
  contactName: string;
  companyName: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  taxCode?: string;
  citizenId?: string;
  provinceId?: number;
  description?: string;
  expectedRevenue?: number;
  sourceId?: number;
  campaignId?: number;
  organizationId?: number;
  assignedTo?: number;
  statusId?: number;
  productInterestIds?: number[];
};

export type UpdateLeadRequest = Partial<CreateLeadRequest>;

export type ConvertLeadRequest = {
  userId?: number;
};

export type LeadResponse = {
  id?: number;
  contactName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  taxCode?: string;
  citizenId?: string;
  provinceId?: number;
  description?: string;
  expectedRevenue?: number;
  sourceId?: number;
  campaignId?: number;
  organizationId?: number;
  assignedTo?: number;
  isConverted?: boolean;
  convertedCustomerId?: number;
  convertedContactId?: number;
  convertedOpportunityId?: number;
  convertedAt?: ISODateTimeString;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  deletedAt?: ISODateTimeString;
  statusId?: number;
  productInterestIds?: number[];
};

export type LeadPageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ConvertLeadResponse = {
  leadId?: number;
  customerId?: number;
  contactId?: number;
  opportunityId?: number;
  convertedAt?: ISODateTimeString;
};

export type LeadActivityStatisticsResponse = {
  callCount: number;
  meetingCount: number;
  emailCount: number;
  totalCount: number;
};

export type LeadDashboardStats = {
  totalLeads: number;
  newLeads: number;
  contactingLeads: number;
  convertedLeads: number;
  expectedRevenueTotal: number;
};

export type LeadReferenceOptionResponse = {
  id: number;
  code: string;
  name: string;
  order?: number;
  isDefault?: boolean;
};

export type LeadReferenceCatalogResponse = {
  statuses: LeadReferenceOptionResponse[];
  sources: LeadReferenceOptionResponse[];
  campaigns: LeadReferenceOptionResponse[];
  meta?: {
    version: string;
    generatedAt: ISODateTimeString;
    cacheTtlSeconds: number;
  };
};

export type MetadataQueryBase = LeadListQuery & {
  q?: string;
};

export type AssigneeMetadataQuery = MetadataQueryBase & {
  organizationId?: number;
  roleId?: number;
  status?: "ACTIVE" | "INACTIVE" | "LOCKED";
  sortBy?: "fullName" | "username" | "createdAt";
};

export type ProductMetadataQuery = MetadataQueryBase & {
  type?: "PRODUCT" | "SERVICE";
  categoryId?: number;
  isActive?: boolean;
  sortBy?: "name" | "skuCode" | "createdAt";
};

export type ProvinceMetadataQuery = MetadataQueryBase & {
  code?: string;
  sortBy?: "name" | "code" | "id";
};

export type OrganizationMetadataQuery = MetadataQueryBase & {
  sortBy?: "name" | "id";
};

export type OrganizationMetadataItem = {
  id: number;
  name: string;
  parentId: number | null;
  type: "COMPANY" | "BRANCH" | "DEPARTMENT" | "TEAM" | string;
  children: OrganizationMetadataItem[];
};

export type MetadataItem = {
  id: number;
  code: string;
  name: string;
};

export type MetadataPageResponse = LeadPageResponse<MetadataItem>;

export type LeadActivityResponse = {
  id?: number;
  leadId?: number;
  activityType?: string;
  subject?: string;
  description?: string;
  startDate?: ISODateTimeString;
  endDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  outcome?: string;
  performedBy?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  status?: number;
  isImportant?: boolean;
};
