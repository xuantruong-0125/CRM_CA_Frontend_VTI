# API Documentation - Customer Module (For React + Next.js)

Tài liệu này mô tả chi tiết các API của module `customers`, bao gồm endpoint, method, payload (request body), kết quả trả về (response) và các export type TypeScript (interfaces) để đội ngũ Frontend (React/Next.js) có thể tích hợp chính xác.

## 1. Base URL & Common Rules

- **Base Path**: `/api/customers`
- Các request cần truyền header `Content-Type: application/json`.
- Kết quả trả về cho các API List (danh sách) sẽ được bọc trong đối tượng `PageResponse<T>` chuẩn của Spring Data.

---

## 2. TypeScript Interfaces (Export Types)

Để đảm bảo type-safety trong dự án React/Next.js, hãy sử dụng các type định nghĩa dưới đây:

```typescript
// --- 1. Request DTOs ---

export interface CreateCustomerDTO {
  name: string; // Tên khách hàng (Bắt buộc)
  type: string; // Loại khách hàng, vd: 'B2B' hoặc 'B2C' (Bắt buộc)
  phone: string; // Số điện thoại (Bắt buộc)
  email?: string; // Email hợp lệ
  taxCode?: string; // Mã số thuế
  shortName?: string; // Tên viết tắt
  fax?: string; // Số fax
  description?: string; // Mô tả
  establishedDate?: string; // Ngày thành lập (Format: YYYY-MM-DD)
  sourceId?: number; // ID nguồn khách hàng
  statusId?: number; // ID trạng thái
  tierId?: number; // ID hạng khách hàng (Tier)
  assignedTo?: number; // ID nhân viên được giao phụ trách
}

export interface UpdateCustomerDTO {
  name?: string;
  shortName?: string;
  phone?: string;
  email?: string;
  fax?: string;
  description?: string;
  establishedDate?: string; // Format: YYYY-MM-DD
  sourceId?: number;
  statusId?: number;
  tierId?: number;
  assignedTo?: number;
}

// --- 2. Response DTOs ---

export interface CustomerResponseDTO {
  id: number;
  customerCode: string;
  type: string;
  name: string;
  shortName?: string;
  taxCode?: string;
  phone: string;
  email?: string;
  fax?: string;
  description?: string;
  sourceId?: number;
  statusName?: string; // Tên trạng thái (được join từ DB)
  tierName?: string; // Tên hạng khách hàng (được join từ DB)
  assignedTo?: number;
  createdAt?: string; // Format: ISO DateTime (YYYY-MM-DDTHH:mm:ss)
  updatedAt?: string; // Format: ISO DateTime
}

// --- 3. Pagination Wrapper ---

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
```

---

## 3. Endpoints Chi Tiết

### 3.1. Tạo khách hàng mới
- **Method:** `POST`
- **URL:** `/api/customers`
- **Request Body (JSON):** `CreateCustomerDTO`
```json
{
  "name": "Công ty TNHH ABC",
  "type": "B2B",
  "phone": "0987654321",
  "email": "contact@abc.com",
  "taxCode": "0101234567",
  "statusId": 1,
  "tierId": 2
}
```
- **Response (201 Created):** `CustomerResponseDTO`
```json
{
  "id": 1,
  "customerCode": "CUS00001",
  "type": "B2B",
  "name": "Công ty TNHH ABC",
  "phone": "0987654321",
  "email": "contact@abc.com",
  "taxCode": "0101234567",
  "statusName": "Active",
  "tierName": "Gold",
  "createdAt": "2026-05-07T10:00:00",
  "updatedAt": "2026-05-07T10:00:00"
}
```

### 3.2. Lấy thông tin chi tiết một khách hàng
- **Method:** `GET`
- **URL:** `/api/customers/{id}`
- **Response (200 OK):** `CustomerResponseDTO` (Tương tự 3.1)

### 3.3. Cập nhật khách hàng
- **Method:** `PUT`
- **URL:** `/api/customers/{id}`
- **Request Body:** `UpdateCustomerDTO`
```json
{
  "name": "Công ty TNHH ABC (Cập nhật)",
  "phone": "0911222333"
}
```
- **Response (200 OK):** `CustomerResponseDTO` (Phiên bản sau khi cập nhật)

### 3.4. Xóa khách hàng (Soft Delete)
- **Method:** `DELETE`
- **URL:** `/api/customers/{id}`
- **Response (204 No Content):** Không có body.

### 3.5. Lấy danh sách khách hàng (Có phân trang)
- **Method:** `GET`
- **URL:** `/api/customers?page=0&size=20&sortBy=createdAt&sortDirection=desc`
- **Tham số:**
  - `page` (int): Số trang (mặc định: 0)
  - `size` (int): Số phần tử trên mỗi trang (mặc định: 20)
  - `sortBy` (string): Trường cần sắp xếp (mặc định: "createdAt")
  - `sortDirection` (string): Hướng sắp xếp "asc" hoặc "desc" (mặc định: "desc")
- **Response (200 OK):** `PageResponse<CustomerResponseDTO>`
```json
{
  "content": [
    {
      "id": 1,
      "customerCode": "CUS00001",
      "type": "B2B",
      "name": "Công ty TNHH ABC",
      "phone": "0987654321",
      "createdAt": "2026-05-07T10:00:00"
    }
  ],
  "pageable": { ... },
  "last": true,
  "totalPages": 1,
  "totalElements": 1,
  "size": 20,
  "number": 0,
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

### 3.6. Lấy danh sách khách hàng B2B
- **Method:** `GET`
- **URL:** `/api/customers/type/b2b?page=0&size=20`
- **Response (200 OK):** `PageResponse<CustomerResponseDTO>`

### 3.7. Lấy danh sách khách hàng B2C
- **Method:** `GET`
- **URL:** `/api/customers/type/b2c?page=0&size=20`
- **Response (200 OK):** `PageResponse<CustomerResponseDTO>`

### 3.8. Tìm khách hàng theo Email
- **Method:** `GET`
- **URL:** `/api/customers/search/email?email={email_cần_tìm}`
- **Response (200 OK):** `CustomerResponseDTO`

### 3.9. Tìm khách hàng theo Mã Khách Hàng (Customer Code)
- **Method:** `GET`
- **URL:** `/api/customers/search/code?code={mã_khách_hàng}`
- **Response (200 OK):** `CustomerResponseDTO`

### 3.10. Lấy danh sách khách hàng được gán cho một nhân viên (Assigned)
- **Method:** `GET`
- **URL:** `/api/customers/assigned/{userId}?page=0&size=20`
- **Response (200 OK):** `PageResponse<CustomerResponseDTO>`

### 3.11. Lấy danh sách khách hàng theo Trạng thái (Status)
- **Method:** `GET`
- **URL:** `/api/customers/status/{statusId}?page=0&size=20`
- **Response (200 OK):** `PageResponse<CustomerResponseDTO>`

### 3.12. Lấy danh sách khách hàng theo Hạng (Tier)
- **Method:** `GET`
- **URL:** `/api/customers/tier/{tierId}?page=0&size=20`
- **Response (200 OK):** `PageResponse<CustomerResponseDTO>`

### 3.13. Cập nhật Trạng thái cho khách hàng
- **Method:** `PATCH`
- **URL:** `/api/customers/{id}/status?statusId={id_trạng_thái}`
- **Response (204 No Content)**

### 3.14. Cập nhật Hạng (Tier) cho khách hàng
- **Method:** `PATCH`
- **URL:** `/api/customers/{id}/tier?tierId={id_hạng}`
- **Response (204 No Content)**

### 3.15. Gán khách hàng cho nhân viên
- **Method:** `PATCH`
- **URL:** `/api/customers/{id}/assign?userId={id_nhân_viên}`
- **Response (204 No Content)**

### 3.16. Đếm tổng số khách hàng hiện có
- **Method:** `GET`
- **URL:** `/api/customers/count`
- **Response (200 OK):** `Long`
```json
1250
```
