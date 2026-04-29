# Tài liệu kết nối FE (React + Vite) với BE CRM

Tài liệu này hướng dẫn team FE code kết nối với BE hiện tại khi FE tách riêng project, đặt cùng cấp với BE.

## 1. Mô hình thư mục đề xuất

Ví dụ cấu trúc cùng cấp:

```text
workspace/
  CRM_CleanArchitect_VTI/     # Backend Spring Boot
  crm-frontend/               # Frontend React + Vite
```

## 2. Backend base URL

- BE local: `http://localhost:8080`
- CORS hiện tại đang mở `*` cho mọi origin/header/method, nên FE local gọi trực tiếp được.

## 3. Biến môi trường cho Vite

Tạo file `.env.development` trong project FE:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Nếu deploy staging/prod thì tạo thêm `.env.staging`, `.env.production` tương ứng.

## 4. API client chuẩn (Axios)

Tạo file `src/shared/api/http.ts`:

```ts
import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Unexpected error";

    return Promise.reject({
      status: error?.response?.status,
      data: error?.response?.data,
      message,
    });
  }
);
```

## 5. Endpoint mapping module Leads

### 5.1 Reference

- `GET /api/leads/references`
  - Chỉ trả `statuses` và `sources` (dữ liệu nhẹ)

### 5.2 Metadata (nặng, có search/autocomplete)

- `GET /api/leads/metadata/assignees?q=&organizationId=&roleId=&status=&page=&size=&sortBy=&sortDir=`
- `GET /api/leads/metadata/products?q=&type=&categoryId=&isActive=&page=&size=&sortBy=&sortDir=`
- `GET /api/leads/metadata/provinces?q=&code=&page=&size=&sortBy=&sortDir=`

### 5.3 Lead CRUD + Search

- `POST /api/leads`
- `GET /api/leads/{id}`
- `PUT /api/leads/{id}`
- `DELETE /api/leads/{id}`
- `GET /api/leads?page=&size=&sortBy=&sortDir=`
- `GET /api/leads/search?provinceId=&organizationId=&phone=&sourceId=&page=&size=&sortBy=&sortDir=`
- `POST /api/leads/{id}/convert`

### 5.4 Activity

- `POST /api/leads/{id}/activities`
- `GET /api/leads/{id}/activities`
- `PUT /api/leads/{leadId}/activities/{activityId}`
- `GET /api/leads/{id}/activities/statistics`

### 5.5 Meeting Task

- `POST /api/leads/{leadId}/meetings`
- `PUT /api/leads/{leadId}/meetings/{meetingId}`

## 6. Service layer mẫu phía FE

Tạo file `src/features/leads/services/leadApi.ts`:

```ts
import { http } from "@/shared/api/http";

export type LeadListQuery = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type LeadSearchQuery = LeadListQuery & {
  provinceId?: number;
  organizationId?: number;
  phone?: string;
  sourceId?: number;
};

export type AssigneeMetadataQuery = LeadListQuery & {
  q?: string;
  organizationId?: number;
  roleId?: number;
  status?: "ACTIVE" | "INACTIVE" | "LOCKED";
  sortBy?: "fullName" | "username" | "createdAt";
};

export type ProductMetadataQuery = LeadListQuery & {
  q?: string;
  type?: "PRODUCT" | "SERVICE";
  categoryId?: number;
  isActive?: boolean;
  sortBy?: "name" | "skuCode" | "createdAt";
};

export type ProvinceMetadataQuery = LeadListQuery & {
  q?: string;
  code?: string;
  sortBy?: "name" | "code" | "id";
};

export const leadApi = {
  getReferences: () => http.get("/api/leads/references"),
  getAssigneeMetadata: (query: AssigneeMetadataQuery) =>
    http.get("/api/leads/metadata/assignees", { params: query }),
  getProductMetadata: (query: ProductMetadataQuery) =>
    http.get("/api/leads/metadata/products", { params: query }),
  getProvinceMetadata: (query: ProvinceMetadataQuery) =>
    http.get("/api/leads/metadata/provinces", { params: query }),

  createLead: (payload: unknown) => http.post("/api/leads", payload),
  getLeadById: (id: number) => http.get(`/api/leads/${id}`),
  updateLead: (id: number, payload: unknown) => http.put(`/api/leads/${id}`, payload),
  deleteLead: (id: number) => http.delete(`/api/leads/${id}`),

  getLeads: (query: LeadListQuery) => http.get("/api/leads", { params: query }),
  searchLeads: (query: LeadSearchQuery) => http.get("/api/leads/search", { params: query }),

  convertLead: (id: number, userId: number) =>
    http.post(`/api/leads/${id}/convert`, { userId }),

  createActivity: (leadId: number, payload: unknown) =>
    http.post(`/api/leads/${leadId}/activities`, payload),
  getActivities: (leadId: number) => http.get(`/api/leads/${leadId}/activities`),
  updateActivity: (leadId: number, activityId: number, payload: unknown) =>
    http.put(`/api/leads/${leadId}/activities/${activityId}`, payload),
  getActivityStats: (leadId: number) =>
    http.get(`/api/leads/${leadId}/activities/statistics`),

  createMeeting: (leadId: number, payload: unknown) =>
    http.post(`/api/leads/${leadId}/meetings`, payload),
  updateMeeting: (leadId: number, meetingId: number, payload: unknown) =>
    http.put(`/api/leads/${leadId}/meetings/${meetingId}`, payload),
};
```

## 7. Các payload mẫu FE nên bám

Nguồn payload test tay đã có sẵn tại:

- `docs/postman/README.md`
- `docs/postman/crm-leads.postman_collection.json`

FE nên dùng đúng field name theo BE để tránh lỗi mapping.

## 8. Quy ước xử lý lỗi trên FE

Khuyến nghị chuẩn hóa một hàm đọc lỗi chung:

```ts
export function getApiErrorMessage(error: any): string {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    "Có lỗi xảy ra, vui lòng thử lại."
  );
}
```

UI nên hiển thị:

- Validation error (400): hiển thị message cụ thể theo field
- Not found (404): hiển thị bản ghi không tồn tại
- Server error (500): hiển thị message fallback

## 9. Checklist FE trước khi commit

1. Đọc được danh mục `references` và bind dropdown.
2. Dùng metadata endpoints cho autocomplete Assignee/Product/Province.
3. List/search lead có phân trang và sort.
4. Create/update/delete lead chạy đúng.
5. Create/update activity chạy đúng.
6. Create/update meeting task chạy đúng.
7. Convert lead chạy đúng.
8. UI hiển thị message lỗi từ BE.

## 10. Ghi chú quan trọng

- API đang chưa có version prefix (`/api/v1`), FE gọi trực tiếp `/api/leads/...`.
- Nếu BE đổi contract DTO, cần cập nhật type FE đồng bộ ngay.
- Nếu sau này BE siết CORS, cần cấu hình lại allow origin theo domain FE.