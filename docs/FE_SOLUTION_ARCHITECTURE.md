# FRONTEND ARCHITECTURE & SOLUTION DESIGN
## Module: Customers (CRM System)

Tài liệu này được thiết kế theo hướng **Frontend Driven** dành cho đội ngũ Kỹ sư Frontend hoặc AI Assistant để triển khai code React + Next.js (App Router) cho module `customers` một cách chuẩn xác, đồng nhất, dễ maintain và tuân thủ Clean Architecture.

---

## 1. Tổng quan module

- **Tên module**: Customers (Quản lý Khách hàng & CRM).
- **Mục đích**: Quản lý vòng đời khách hàng (từ Lead -> Prospect -> Active Client), bao gồm thông tin liên hệ, cơ hội bán hàng (Opportunities), hợp đồng (Contracts), báo giá (Quotes), hóa đơn (Invoices), hoạt động chăm sóc (Activities), và công việc (Tasks).
- **Vai trò trong hệ thống**: Là module lõi (Core) của hệ thống CRM. Các module khác (như Bán hàng, Support) đều tham chiếu đến dữ liệu Khách hàng.
- **Các chức năng chính**: 
  - CRUD Khách hàng (B2B, B2C).
  - Quản lý Contact (Người liên hệ).
  - Quản lý Cơ hội bán hàng (Pipeline, Stage).
  - Quản lý Hợp đồng, Báo giá, Hóa đơn.
  - Theo dõi Tương tác (Activities, Tasks, Feedback).
- **Các actor sử dụng**: Sales Representative, Sales Manager, Customer Success, System Admin.

---

## 2. Danh sách màn hình FE cần có (Dựa trên 11 Controllers)

Dựa trên cấu trúc Backend (11 Controllers của module Customers), hệ thống Frontend cần cung cấp các màn hình tương ứng sau đây:

### 2.1. Customer Management (Khách hàng)
- **Route**: `/crm/customers` (Danh sách), `/crm/customers/[id]` (Chi tiết 360-độ)
- **Chức năng**: Quản lý danh sách KH, lọc theo Status/Tier. Trang chi tiết chứa các Tabs cho Address, Contacts, Opportunities, Activities, Tasks, Contracts, Invoices, Attachments, Feedbacks.
- **Component chính**: `CustomerTable`, `CustomerFormDrawer`, `CustomerOverviewCard`.

### 2.2. Contact Management (Liên hệ)
- **Route**: `/crm/contacts` hoặc nằm trong Tab `/crm/customers/[id]?tab=contacts`
- **Chức năng**: Quản lý danh sách người liên hệ của khách hàng. Có thể set Primary Contact.
- **Component chính**: `ContactTable`, `ContactFormDialog`.

### 2.3. Opportunity Management (Cơ hội bán hàng)
- **Route**: `/crm/opportunities` (List view), `/crm/opportunities/board` (Kanban view)
- **Chức năng**: Quản lý Pipeline, chuyển đổi Stage/Health Status bằng Drag & Drop.
- **Component chính**: `OpportunityKanbanBoard`, `OpportunityTable`, `OpportunityFormSheet`.

### 2.4. Contract Management (Hợp đồng)
- **Route**: `/crm/contracts`
- **Chức năng**: Quản lý danh sách hợp đồng, theo dõi Status (DRAFT, ACTIVE, EXPIRED), quản lý file đính kèm hợp đồng.
- **Component chính**: `ContractTable`, `ContractFormDrawer`, `ContractStatusBadge`.

### 2.5. Quote Management (Báo giá)
- **Route**: `/crm/quotes`
- **Chức năng**: Quản lý báo giá, tính toán subtotal/discount/total, in/xuất báo giá PDF.
- **Component chính**: `QuoteTable`, `QuoteBuilderForm`.

### 2.6. Invoice Management (Hóa đơn)
- **Route**: `/crm/invoices`
- **Chức năng**: Quản lý hóa đơn, theo dõi công nợ (paidAmount, totalAmount), dueDate.
- **Component chính**: `InvoiceTable`, `InvoicePaymentDialog`.

### 2.7. Task & Activity Management (Công việc & Hoạt động)
- **Route**: `/crm/tasks`, `/crm/activities`
- **Chức năng**: Hiển thị Calendar hoặc danh sách công việc/hoạt động (Call, Email, Meeting) của nhân viên.
- **Component chính**: `TaskBoard`, `ActivityTimeline`, `TaskFormDialog`.

### 2.8. Feedback Management (Phản hồi)
- **Route**: `/crm/feedbacks`
- **Chức năng**: Quản lý ticket/phản hồi từ KH, ưu tiên (Priority), trạng thái giải quyết.
- **Component chính**: `FeedbackTable`, `FeedbackDetailDrawer`.

---

## 3. API Mapping cho FE (Core APIs)

*Do số lượng API lớn (hơn 80+ endpoints), dưới đây trình bày cấu trúc mẫu cho các Core API. Toàn bộ API tuân theo chuẩn RESTful.*

### 3.1. Danh sách khách hàng (GET `/api/customers`)
- **Purpose**: Lấy danh sách khách hàng (Server-side pagination).
- **Query params**:
  - `page`: number (default: 0)
  - `size`: number (default: 20)
  - `sortBy`: string (default: "createdAt")
  - `sortDirection`: string ("asc" | "desc")
- **Response**:
  ```json
  {
    "content": [{ "id": 1, "name": "ABC Corp", "type": "B2B", "statusName": "Active" }],
    "totalPages": 10,
    "totalElements": 200,
    "number": 0,
    "size": 20,
    "last": false
  }
  ```
- **Error response**: `400 Bad Request` (Invalid params), `401 Unauthorized`.
- **Frontend handling**:
  - Loading skeleton table (10 rows).
  - Empty state component với nút "Tạo khách hàng mới".
  - Cache query bằng TanStack Query: `queryKey: ['customers', filterOptions]`.
  - Keep previous data khi đang fetching page mới.

### 3.2. Cập nhật trạng thái khách hàng (PATCH `/api/customers/{id}/status`)
- **Purpose**: Đổi trạng thái khách hàng nhanh (Quick action).
- **Query params**: `statusId` (number)
- **Response**: `204 No Content`
- **Frontend handling**:
  - Optimistic Update: Cập nhật UI ngay lập tức trước khi gọi API.
  - Rollback nếu API lỗi và hiển thị `Toast.error`.

---

## 4. Data Model cho FE (TypeScript & Zod)

### 4.1. TypeScript Interfaces
```typescript
// types/customer.ts
export type CustomerType = 'B2B' | 'B2C';
export type HealthStatus = 'ON_TRACK' | 'AT_RISK' | 'NEEDS_ATTENTION' | 'LOST';

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer extends BaseEntity {
  customerCode: string;
  type: CustomerType;
  name: string;
  shortName?: string;
  taxCode?: string;
  phone: string;
  email?: string;
  statusName?: string;
  tierName?: string;
  assignedTo?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}
```

### 4.2. Zod Schemas (Form Model)
```typescript
// schemas/customer.schema.ts
import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').max(100),
  type: z.enum(['B2B', 'B2C'], { required_error: 'Vui lòng chọn loại khách hàng' }),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  taxCode: z.string().optional(),
  establishedDate: z.string().optional(), // YYYY-MM-DD
  statusId: z.number().int().positive('Vui lòng chọn trạng thái').optional(),
  tierId: z.number().int().positive().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
```

---

## 5. Form Specification

### Customer Creation Form
| Field | UI Component | Data Type | Validation (Zod) | Required | Business Rule |
|-------|-------------|-----------|------------------|----------|---------------|
| Tên khách hàng | `Input` | string | min(2) | **Yes** | Phải là tên hợp lệ. |
| Phân loại | `RadioGroup` / `Select` | enum | B2B/B2C | **Yes** | Quyết định các trường nhập liệu phụ phía dưới. |
| Điện thoại | `Input` | string | regex | **Yes** | Số điện thoại chuẩn VN. |
| Email | `Input` | string | email | No | Nên check trùng lặp (Debounce API call). |
| Mã số thuế | `Input` | string | string | No | Required nếu là KH doanh nghiệp (B2B). |
| Trạng thái | `Select` | number | positive | No | Default là Lead. |

---

## 6. UI/UX Requirement

- **Library**: `shadcn/ui` (Radix UI + TailwindCSS).
- **Layout**: 
  - Sidebar cố định bên trái (Navigation).
  - Header trên cùng (Search global, Notification, Profile).
  - Main content area có background `#f4f4f5` (Zinc 100), các thẻ card màu trắng có shadow mỏng `shadow-sm`.
- **Responsive**: 
  - Desktop: Table full columns.
  - Mobile: Ẩn bớt cột trong Table, hoặc chuyển sang dạng List Cards.
- **Drawer/Dialog**: 
  - Form tạo/sửa dùng `Sheet` (Drawer) trượt từ bên phải ra (width: 400px - 600px).
  - Alert xác nhận xóa dùng `Dialog` (Modal) giữa màn hình.
- **Feedback**: 
  - Mọi action (Create, Update, Delete) đều phải có `Toast` notification (Success/Error).
  - Loading State dùng Skeleton loading, KHÔNG dùng Spinner làm rung giật UI.
- **Empty State**: Khi không có dữ liệu, hiển thị SVG Illustration + Message + Call to Action button.

---

## 7. Business Rules (Frontend Cần Xử Lý)

1. **Khách hàng B2B vs B2C**: Nếu người dùng chọn `type === 'B2B'`, trường `taxCode` bắt buộc nhập.
2. **Xóa khách hàng**: FE gọi hàm DELETE `/api/customers/{id}` (Soft delete). Cần hiển thị cảnh báo: "Khách hàng này sẽ được đưa vào thùng rác. Các cơ hội bán hàng liên quan có thể bị ảnh hưởng."
3. **Phân quyền**: Nếu User không có role `MANAGER` hoặc không phải là người được Assign (`assignedTo === currentUser.id`), thì **Disable** nút Edit/Delete.
4. **Form submit**: Nút "Lưu" phải chuyển sang trạng thái Loading (có spinner bên trong nút, disable click) để tránh double submit.

---

## 8. State Management

1. **Server State (TanStack Query)**:
   - Toàn bộ việc call API (Fetch list, fetch detail, create, update, delete).
   - Sử dụng tính năng Invalidation (`queryClient.invalidateQueries`) để làm mới danh sách sau khi Create/Update/Delete thành công.
2. **Local Form State (React Hook Form)**:
   - Trạng thái input (value, dirty, errors, touched).
   - Form submission lifecycle.
3. **Global UI State (Zustand)**:
   - Đóng/Mở Sidebar.
   - Trạng thái User đang đăng nhập.
4. **URL State (Next.js Navigation)**:
   - Keyword tìm kiếm, pagination page, sort order cần lưu trực tiếp trên URL Query Params (`?page=1&search=ABC`) để dễ dàng chia sẻ link và back navigation.

---

## 9. Cấu trúc thư mục (FE Folder Structure Suggestion)

Kiến trúc Feature-sliced design / Domain-driven bên trong Next.js App Router:

```text
src/
├── app/
│   └── (dashboard)/
│       └── crm/
│           └── customers/
│               ├── page.tsx          # Page UI
│               └── [id]/page.tsx     # Detail Page UI
├── modules/
│   └── customer/
│       ├── api/
│       │   ├── customer.api.ts       # Axios calls (getCustomers, createCustomer,...)
│       │   └── activity.api.ts
│       ├── components/
│       │   ├── CustomerTable.tsx
│       │   ├── CustomerFormSheet.tsx
│       │   └── detail/
│       │       └── OverviewTab.tsx
│       ├── hooks/
│       │   ├── useCustomers.ts       # TanStack Query custom hooks
│       │   └── useCustomerMutations.ts
│       ├── schemas/
│       │   └── customer.schema.ts    # Zod schemas
│       └── types/
│           └── index.ts              # TS Interfaces
├── components/
│   └── ui/                           # shadcn/ui shared components (Button, Input, Table...)
└── lib/
    ├── axios.ts                      # Axios instance config + interceptors
    └── utils.ts                      # Tailwind merge utils
```

---

## 10. FE Implementation Notes

1. **Debounce Search**:
   ```typescript
   import { useDebounce } from 'use-debounce';
   const [search] = useDebounce(inputValue, 500);
   // Gọi API fetch danh sách bằng giá trị `search` thay vì `inputValue`.
   ```
2. **Optimistic Updates**: Khi Assign User hoặc đổi Status KH, FE cập nhật state trong Query Cache ngay lập tức cho mượt, sau đó mutate API.
3. **Component tái sử dụng**: Bảng `DataTable` cần viết dạng generic, nhận columns định nghĩa từ `@tanstack/react-table`.
4. **API Polling/Refresh**: Cấu hình TanStack Query `staleTime: 60000` (1 phút) cho list data để tránh gọi API liên tục khi chuyển tab.

---

## 11. Security & Permission

- **Axios Interceptor**: Tự động đính kèm `Authorization: Bearer <token>` vào mọi request. Xử lý lỗi `401` bằng cách redirect về trang Login, xóa token.
- **Route Guard**: Middleware Next.js kiểm tra cookie token, redirect người dùng chưa đăng nhập.
- **Role-based Rendering**: Viết custom hook `usePermission(action)`.
  ```tsx
  {hasPermission('DELETE_CUSTOMER') && <Button variant="destructive">Xóa</Button>}
  ```

---

## 12. Edge Cases (Các trường hợp ngoại lệ)

- **Empty State**: Khi hệ thống chưa có khách hàng nào, hiển thị Component rỗng (EmptyState.tsx) để hướng dẫn user.
- **Lỗi mạng (Timeout)**: Hiển thị lỗi "Không thể kết nối đến máy chủ" kèm nút Retry.
- **Concurrent Editing**: Nếu User A và User B cùng sửa 1 bản ghi, hệ thống BE có thể ném lỗi version. Bắt lỗi `409 Conflict` và báo user load lại trang.
- **Xóa bản ghi đang xem**: Nếu user đang mở Detail Page của KH bị admin xóa, API GET detail sẽ trả 404 -> Redirect user về danh sách KH.

---

## 13. AI Coding Instruction (HƯỚNG DẪN DÀNH CHO AI CODE FE)

Khi bạn (AI) nhận yêu cầu sinh code cho màn hình thuộc module `customers`, hãy TUÂN THỦ TỐI ĐA các nguyên tắc sau:

1. **Strict TypeScript**: 
   - KHÔNG sử dụng `any`. 
   - Luôn import type chuẩn từ `modules/customer/types`.
2. **Clean Architecture**: 
   - KHÔNG call axios trực tiếp trong Component.
   - Luôn bọc api call trong Custom Hooks dùng `@tanstack/react-query`.
3. **Phân tách Component**:
   - `page.tsx` là Server Component (nếu không có state) hoặc Client Component giữ vai trò Page Container.
   - Chia nhỏ file: `CustomerTable.tsx` riêng, `CustomerFilter.tsx` riêng.
4. **Validation**: 
   - Bắt buộc dùng `zodResolver` kết hợp `react-hook-form`.
5. **UI Component**: 
   - Sử dụng các components thuộc hệ sinh thái `shadcn/ui` (chạy class variance authority `cva`, `cn` utility).
   - Các icon dùng `lucide-react`.
6. **Data flow**:
   - API call -> Tanstack Query (Custom hook) -> UI Component -> Props mapping -> Render.
7. **Tránh Hardcode**: 
   - Đưa các danh sách Options (B2B, B2C), Statuses ra file constants.

---
> **End of Architecture Document.** Tác giả: Senior Solution Architect & Frontend Engineer.
> (Tài liệu này tích hợp với file `api_summary_utf8.txt` và `CUSTOMER_API_FE.md` để mapping API cụ thể).
