# Frontend API Types (Leads Module)

Tài liệu này định nghĩa sẵn TypeScript types cho FE (React + Vite) theo DTO backend hiện tại của module `leads`.

## 1. Type cơ bản

```ts
export type ISODateTimeString = string;

export type SortDir = "asc" | "desc";

export type Nullable<T> = T | null;
```

## 2. Request types

```ts
export type CreateLeadRequest = {
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
  statusId?: number;
  productInterestIds?: number[];
};

export type UpdateLeadRequest = {
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
  statusId?: number;
  productInterestIds?: number[];
};

export type SearchLeadRequest = {
  provinceId?: number;
  organizationId?: number;
  phone?: string;
  email?: string;
  statusId?: number;
  sourceId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: SortDir;
};

export type AssigneeMetadataQuery = {
  q?: string;
  organizationId?: number;
  roleId?: number;
  status?: "ACTIVE" | "INACTIVE" | "LOCKED";
  page?: number;
  size?: number;
  sortBy?: "fullName" | "username" | "createdAt";
  sortDir?: SortDir;
};

export type ProductMetadataQuery = {
  q?: string;
  type?: "PRODUCT" | "SERVICE";
  categoryId?: number;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: "name" | "skuCode" | "createdAt";
  sortDir?: SortDir;
};

export type ProvinceMetadataQuery = {
  q?: string;
  code?: string;
  page?: number;
  size?: number;
  sortBy?: "name" | "code" | "id";
  sortDir?: SortDir;
};

export type ConvertLeadRequest = {
  userId?: number;
};

export type CreateLeadActivityRequest = {
  activityType?: "CALL" | "MEETING" | "EMAIL" | string;
  subject?: string;
  description?: string;
  startDate?: ISODateTimeString;
  endDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  outcome?: string;
  performedBy?: number;
  createdBy?: number;
  status?: number;
  isImportant?: boolean;
};

export type UpdateLeadActivityRequest = {
  activityType?: "CALL" | "MEETING" | "EMAIL" | string;
  subject?: string;
  description?: string;
  startDate?: ISODateTimeString;
  endDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  outcome?: string;
  performedBy?: number;
  updatedBy?: number;
  status?: number;
  isImportant?: boolean;
};

export type CreateLeadMeetingRequest = {
  subject?: string;
  description?: string;
  startDate?: ISODateTimeString;
  dueDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  status?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  progressPercent?: number;
  assignedTo?: number;
  assignedBy?: number;
  createdBy?: number;
  contactId?: number;
};

export type UpdateLeadMeetingRequest = {
  subject?: string;
  description?: string;
  startDate?: ISODateTimeString;
  dueDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  status?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  progressPercent?: number;
  assignedTo?: number;
  assignedBy?: number;
  updatedBy?: number;
  contactId?: number;
};
```

## 3. Response types

```ts
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

export type LeadActivityStatisticsResponse = {
  callCount: number;
  meetingCount: number;
  emailCount: number;
  totalCount: number;
};

export type LeadMeetingTaskResponse = {
  id?: number;
  leadId?: number;
  taskType?: string;
  subject?: string;
  description?: string;
  startDate?: ISODateTimeString;
  dueDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  status?: string;
  priority?: string;
  progressPercent?: number;
  assignedTo?: number;
  assignedBy?: number;
  createdBy?: number;
  updatedBy?: number;
  contactId?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
};

export type LeadReferenceOptionResponse = {
  id?: number;
  code?: string;
  name?: string;
};

export type LeadReferenceCatalogResponse = {
  statuses: LeadReferenceOptionResponse[];
  sources: LeadReferenceOptionResponse[];
};

export type LeadMetadataPageResponse = {
  content: LeadReferenceOptionResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
```

## 4. Error response types

```ts
export type LeadErrorResponse = {
  status: number;
  errorCode: string;
  message: string;
  path: string;
  timestamp: ISODateTimeString;
};

export type ApiError = {
  status: number;
  message: string;
  timestamp: ISODateTimeString;
};
```

## 5. Wrapper type cho Axios response

```ts
export type ApiResult<T> = Promise<T>;
```

Nếu dùng Axios, thường unwrap như sau:

```ts
import { http } from "@/shared/api/http";

export const getLeadById = async (id: number): ApiResult<LeadResponse> => {
  const response = await http.get<LeadResponse>(`/api/leads/${id}`);
  return response.data;
};
```

## 6. Gợi ý tổ chức file type phía FE

```text
src/
  features/
    leads/
      types/
        lead.request.ts
        lead.response.ts
        lead.error.ts
```

## 7. Nguồn DTO backend đang map theo

- `src/main/java/org/example/crm_project/modules/leads/application/dto/request/*`
- `src/main/java/org/example/crm_project/modules/leads/application/dto/response/*`
- `src/main/java/org/example/crm_project/modules/leads/presentation/dto/LeadErrorResponse.java`
- `src/main/java/org/example/crm_project/shared/exception/ApiError.java`

Nếu backend đổi field hoặc kiểu dữ liệu, cập nhật type FE ngay để tránh sai contract.