# API Documentation - Customer Module Frontend Guide

**Version**: 1.0  
**Last Updated**: May 6, 2026  
**Status**: Production Ready

---

## 1. Base Configuration

### Base URL
```
http://localhost:8080/api
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Pagination (tất cả endpoints GET với list)
- **Default Page Size**: 20
- **Max Page Size**: 100
- **Query Parameters**: 
  - `page`: 0-indexed (0 = trang đầu tiên)
  - `size`: số items per page
  - `sort`: ví dụ: `sort=createdAt,desc`

**Example**: `/api/v1/customers?page=0&size=10&sort=createdAt,desc`

---

## 2. Customer Management

### 2.1. Tạo Khách Hàng
**POST** `/customers`

**Request Body**:
```json
{
  "customerName": "Công ty ABC",
  "email": "contact@abc.com",
  "phone": "0989123456",
  "customerType": "COMPANY",
  "status": "ACTIVE",
  "taxCode": "0123456789",
  "description": "Khách hàng tiềm năng"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerName": "Công ty ABC",
  "email": "contact@abc.com",
  "phone": "0989123456",
  "customerType": "COMPANY",
  "status": "ACTIVE",
  "taxCode": "0123456789",
  "description": "Khách hàng tiềm năng",
  "createdAt": "2026-05-06T10:30:00",
  "updatedAt": "2026-05-06T10:30:00"
}
```

### 2.2. Lấy Thông Tin Khách Hàng
**GET** `/customers/{id}`

**Response** (200 OK):
```json
{
  "id": 1,
  "customerName": "Công ty ABC",
  "email": "contact@abc.com",
  "phone": "0989123456",
  "customerType": "COMPANY",
  "status": "ACTIVE",
  "taxCode": "0123456789",
  "description": "Khách hàng tiềm năng",
  "createdAt": "2026-05-06T10:30:00",
  "updatedAt": "2026-05-06T10:30:00"
}
```

### 2.3. Danh Sách Khách Hàng
**GET** `/customers?page=0&size=10&sort=createdAt,desc`

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "customerName": "Công ty ABC",
      "email": "contact@abc.com",
      "phone": "0989123456",
      "customerType": "COMPANY",
      "status": "ACTIVE",
      "createdAt": "2026-05-06T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": "createdAt: DESC"
  },
  "totalElements": 150,
  "totalPages": 15,
  "first": true,
  "last": false,
  "hasNext": true,
  "hasPrevious": false
}
```

### 2.4. Cập Nhật Khách Hàng
**PUT** `/customers/{id}`

**Request Body**:
```json
{
  "customerName": "Công ty ABC Updated",
  "email": "newemail@abc.com",
  "phone": "0989654321",
  "status": "INACTIVE"
}
```

**Response** (200 OK): (Same as 2.1)

### 2.5. Xóa Khách Hàng (Soft Delete)
**DELETE** `/customers/{id}`

**Response** (204 No Content)

### 2.6. Danh Sách Khách Hàng Theo Trạng Thái
**GET** `/customers/status/{status}?page=0&size=10`

**Parameters**:
- `status`: ACTIVE | INACTIVE | LEAD | PROSPECT

**Response**: (Tương tự 2.3)

### 2.7. Tìm Kiếm Khách Hàng
**GET** `/customers/search?keyword=ABC&page=0&size=10`

**Parameters**:
- `keyword`: Tên hoặc email khách hàng

**Response**: (Tương tự 2.3)

### 2.8. Số Lượng Khách Hàng
**GET** `/customers/count`

**Response** (200 OK):
```json
150
```

---

## 3. Contact Management (Liên Hệ)

### 3.1. Tạo Liên Hệ
**POST** `/contacts`

**Request Body**:
```json
{
  "customerId": 1,
  "contactName": "Nguyễn Văn A",
  "email": "nguyenvana@abc.com",
  "phone": "0987654321",
  "position": "Giám đốc",
  "birthDate": "1990-01-15",
  "gender": "MALE",
  "departmentId": 5,
  "isPrimary": true
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "contactName": "Nguyễn Văn A",
  "email": "nguyenvana@abc.com",
  "phone": "0987654321",
  "position": "Giám đốc",
  "birthDate": "1990-01-15",
  "gender": "MALE",
  "departmentId": 5,
  "isPrimary": true,
  "createdAt": "2026-05-06T10:30:00"
}
```

### 3.2. Lấy Thông Tin Liên Hệ
**GET** `/contacts/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 3.3. Danh Sách Liên Hệ Theo Khách Hàng
**GET** `/contacts/customer/{customerId}?page=0&size=10`

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "customerId": 1,
      "contactName": "Nguyễn Văn A",
      "email": "nguyenvana@abc.com",
      "phone": "0987654321",
      "position": "Giám đốc",
      "isPrimary": true,
      "createdAt": "2026-05-06T10:30:00"
    }
  ],
  "pageable": {},
  "totalElements": 5,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

### 3.4. Cập Nhật Liên Hệ
**PUT** `/contacts/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 3.5. Xóa Liên Hệ
**DELETE** `/contacts/{id}`

**Response** (204 No Content)

### 3.6. Số Lượng Liên Hệ
**GET** `/contacts/count`

**Response** (200 OK): `42`

---

## 4. Activity Management (Hoạt Động)

### 4.1. Tạo Hoạt Động
**POST** `/activities`

**Request Body**:
```json
{
  "customerId": 1,
  "activityType": "CALL",
  "subject": "Cuộc gọi với khách hàng",
  "description": "Thảo luận về dự án",
  "activityDate": "2026-05-06",
  "startTime": "10:00",
  "endTime": "11:00",
  "assignedUserId": 1,
  "location": "Văn phòng công ty"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "activityType": "CALL",
  "subject": "Cuộc gọi với khách hàng",
  "description": "Thảo luận về dự án",
  "activityDate": "2026-05-06",
  "startTime": "10:00",
  "endTime": "11:00",
  "assignedUserId": 1,
  "location": "Văn phòng công ty",
  "createdAt": "2026-05-06T10:30:00"
}
```

### 4.2. Lấy Thông Tin Hoạt Động
**GET** `/activities/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 4.3. Danh Sách Hoạt Động Theo Khách Hàng
**GET** `/activities/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 4.4. Danh Sách Hoạt Động Theo Người Dùng
**GET** `/activities/user/{userId}?page=0&size=10`

**Response**: (Paginated list)

### 4.5. Danh Sách Hoạt Động Theo Loại
**GET** `/activities/type/{activityType}?page=0&size=10`

**Parameters**:
- `activityType`: CALL | EMAIL | MEETING | TASK | OTHER

**Response**: (Paginated list)

### 4.6. Cập Nhật Hoạt Động
**PUT** `/activities/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 4.7. Xóa Hoạt Động
**DELETE** `/activities/{id}`

**Response** (204 No Content)

### 4.8. Số Lượng Hoạt Động
**GET** `/activities/count`

**Response** (200 OK): `256`

---

## 5. Task Management (Tác Vụ)

### 5.1. Tạo Tác Vụ
**POST** `/tasks`

**Request Body**:
```json
{
  "customerId": 1,
  "taskTitle": "Ghi chú theo dõi khách hàng",
  "description": "Cần liên hệ để xác nhận đơn hàng",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-05-10",
  "assignedUserId": 1,
  "relatedEntityType": "CUSTOMER"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "taskTitle": "Ghi chú theo dõi khách hàng",
  "description": "Cần liên hệ để xác nhận đơn hàng",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-05-10",
  "assignedUserId": 1,
  "createdAt": "2026-05-06T10:30:00"
}
```

### 5.2. Lấy Thông Tin Tác Vụ
**GET** `/tasks/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 5.3. Danh Sách Tác Vụ Theo Khách Hàng
**GET** `/tasks/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 5.4. Danh Sách Tác Vụ Theo Người Dùng
**GET** `/tasks/user/{userId}?page=0&size=10`

**Response**: (Paginated list)

### 5.5. Danh Sách Tác Vụ Theo Trạng Thái
**GET** `/tasks/status/{status}?page=0&size=10`

**Parameters**:
- `status`: PENDING | IN_PROGRESS | COMPLETED | CANCELLED

**Response**: (Paginated list)

### 5.6. Danh Sách Tác Vụ Theo Ưu Tiên
**GET** `/tasks/priority/{priority}?page=0&size=10`

**Parameters**:
- `priority`: LOW | MEDIUM | HIGH | URGENT

**Response**: (Paginated list)

### 5.7. Cập Nhật Tác Vụ
**PUT** `/tasks/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 5.8. Xóa Tác Vụ
**DELETE** `/tasks/{id}`

**Response** (204 No Content)

### 5.9. Số Lượng Tác Vụ
**GET** `/tasks/count`

**Response** (200 OK): `189`

---

## 6. Opportunity Management (Cơ Hội)

### 6.1. Tạo Cơ Hội
**POST** `/opportunities`

**Request Body**:
```json
{
  "name": "Dự án lớn Q2 2026",
  "customerId": 1,
  "pipelineId": 1,
  "stageId": 1,
  "totalAmount": 500000000,
  "depositAmount": 100000000,
  "remainingAmount": 400000000,
  "currencyCode": "VND",
  "exchangeRate": 1.0,
  "expectedCloseDate": "2026-06-30",
  "healthStatus": "ON_TRACK",
  "assignedUserId": 1
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "Dự án lớn Q2 2026",
  "customerId": 1,
  "totalAmount": 500000000,
  "depositAmount": 100000000,
  "remainingAmount": 400000000,
  "healthStatus": "ON_TRACK",
  "assignedUserId": 1,
  "createdAt": "2026-05-06T10:30:00"
}
```

### 6.2. Lấy Cơ Hội
**GET** `/opportunities/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 6.3. Danh Sách Cơ Hội Theo Khách Hàng
**GET** `/opportunities/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 6.4. Danh Sách Cơ Hội Theo Người Dùng
**GET** `/opportunities/user/{userId}?page=0&size=10`

**Response**: (Paginated list)

### 6.5. Danh Sách Cơ Hội Theo Health Status
**GET** `/opportunities/status/{healthStatus}?page=0&size=10`

**Parameters**:
- `healthStatus`: ON_TRACK | AT_RISK | NEEDS_ATTENTION | LOST

**Response**: (Paginated list)

### 6.6. Cập Nhật Cơ Hội
**PUT** `/opportunities/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 6.7. Xóa Cơ Hội
**DELETE** `/opportunities/{id}`

**Response** (204 No Content)

### 6.8. Số Lượng Cơ Hội
**GET** `/opportunities/count`

**Response** (200 OK): `45`

---

## 7. Feedback Management (Phản Hồi)

### 7.1. Tạo Phản Hồi
**POST** `/feedbacks`

**Request Body**:
```json
{
  "customerId": 1,
  "subject": "Đánh giá về dịch vụ",
  "description": "Rất hài lòng với chất lượng dịch vụ",
  "priority": "MEDIUM",
  "status": "NEW",
  "assignedTo": 1
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "subject": "Đánh giá về dịch vụ",
  "description": "Rất hài lòng với chất lượng dịch vụ",
  "priority": "MEDIUM",
  "status": "NEW",
  "assignedTo": 1,
  "createdAt": "2026-05-06T10:30:00"
}
```

### 7.2. Lấy Phản Hồi
**GET** `/feedbacks/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 7.3. Danh Sách Phản Hồi Theo Khách Hàng
**GET** `/feedbacks/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 7.4. Danh Sách Phản Hồi Theo Trạng Thái
**GET** `/feedbacks/status/{status}?page=0&size=10`

**Parameters**:
- `status`: NEW | IN_PROGRESS | RESOLVED | CLOSED

**Response**: (Paginated list)

### 7.5. Danh Sách Phản Hồi Theo Ưu Tiên
**GET** `/feedbacks/priority/{priority}?page=0&size=10`

**Parameters**:
- `priority`: LOW | MEDIUM | HIGH | URGENT

**Response**: (Paginated list)

### 7.6. Cập Nhật Phản Hồi
**PUT** `/feedbacks/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 7.7. Xóa Phản Hồi
**DELETE** `/feedbacks/{id}`

**Response** (204 No Content)

### 7.8. Số Lượng Phản Hồi
**GET** `/feedbacks/count`

**Response** (200 OK): `78`

---

## 8. Contract Management (Hợp Đồng)

### 8.1. Tạo Hợp Đồng
**POST** `/contracts`

**Request Body**:
```json
{
  "customerId": 1,
  "contractCode": "HD20260506001",
  "contractName": "Hợp đồng cung cấp dịch vụ IT",
  "startDate": "2026-05-01",
  "endDate": "2027-05-01",
  "totalValue": 1500000000,
  "status": "ACTIVE",
  "templateId": 1
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "contractCode": "HD20260506001",
  "contractName": "Hợp đồng cung cấp dịch vụ IT",
  "startDate": "2026-05-01",
  "endDate": "2027-05-01",
  "totalValue": 1500000000,
  "status": "ACTIVE",
  "createdAt": "2026-05-06T10:30:00"
}
```

### 8.2. Lấy Hợp Đồng
**GET** `/contracts/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 8.3. Lấy Hợp Đồng Theo Mã
**GET** `/contracts/code/{contractCode}`

**Response** (200 OK): (Tương tự response tạo hoặc 404)

### 8.4. Danh Sách Hợp Đồng Theo Khách Hàng
**GET** `/contracts/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 8.5. Danh Sách Hợp Đồng Theo Trạng Thái
**GET** `/contracts/status/{status}?page=0&size=10`

**Parameters**:
- `status`: DRAFT | ACTIVE | EXPIRED | TERMINATED

**Response**: (Paginated list)

### 8.6. Cập Nhật Hợp Đồng
**PUT** `/contracts/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 8.7. Xóa Hợp Đồng
**DELETE** `/contracts/{id}`

**Response** (204 No Content)

### 8.8. Số Lượng Hợp Đồng
**GET** `/contracts/count`

**Response** (200 OK): `32`

---

## 9. Quote Management (Báo Giá)

### 9.1. Tạo Báo Giá
**POST** `/quotes`

**Request Body**:
```json
{
  "customerId": 1,
  "quoteCode": "BG20260506001",
  "quoteName": "Báo giá dự án A",
  "quoteDate": "2026-05-06",
  "validUntil": "2026-05-20",
  "subtotalAmount": 100000000,
  "discountAmount": 10000000,
  "totalAmount": 90000000,
  "status": "PENDING",
  "notes": "Giá không bao gồm VAT",
  "templateId": 1
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "quoteCode": "BG20260506001",
  "quoteName": "Báo giá dự án A",
  "totalAmount": 90000000,
  "status": "PENDING",
  "createdAt": "2026-05-06T10:30:00"
}
```

### 9.2. Lấy Báo Giá
**GET** `/quotes/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 9.3. Lấy Báo Giá Theo Mã
**GET** `/quotes/code/{quoteCode}`

**Response** (200 OK): (Tương tự response tạo hoặc 404)

### 9.4. Danh Sách Báo Giá Theo Khách Hàng
**GET** `/quotes/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 9.5. Danh Sách Báo Giá Theo Trạng Thái
**GET** `/quotes/status/{status}?page=0&size=10`

**Parameters**:
- `status`: PENDING | ACCEPTED | REJECTED | EXPIRED

**Response**: (Paginated list)

### 9.6. Cập Nhật Báo Giá
**PUT** `/quotes/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 9.7. Xóa Báo Giá
**DELETE** `/quotes/{id}`

**Response** (204 No Content)

### 9.8. Số Lượng Báo Giá
**GET** `/quotes/count`

**Response** (200 OK): `28`

---

## 10. Invoice Management (Hóa Đơn)

### 10.1. Tạo Hóa Đơn
**POST** `/invoices`

**Request Body**:
```json
{
  "customerId": 1,
  "invoiceCode": "HD20260506001",
  "invoiceName": "Hóa đơn dự án A",
  "invoiceDate": "2026-05-06",
  "dueDate": "2026-05-20",
  "subtotalAmount": 100000000,
  "taxAmount": 10000000,
  "totalAmount": 110000000,
  "paidAmount": 0,
  "status": "ISSUED",
  "paymentMethod": "BANK_TRANSFER",
  "notes": "Thanh toán trong vòng 14 ngày",
  "templateId": 1
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "invoiceCode": "HD20260506001",
  "invoiceName": "Hóa đơn dự án A",
  "totalAmount": 110000000,
  "paidAmount": 0,
  "status": "ISSUED",
  "createdAt": "2026-05-06T10:30:00"
}
```

### 10.2. Lấy Hóa Đơn
**GET** `/invoices/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 10.3. Lấy Hóa Đơn Theo Mã
**GET** `/invoices/code/{invoiceCode}`

**Response** (200 OK): (Tương tự response tạo hoặc 404)

### 10.4. Danh Sách Hóa Đơn Theo Khách Hàng
**GET** `/invoices/customer/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 10.5. Danh Sách Hóa Đơn Theo Trạng Thái
**GET** `/invoices/status/{status}?page=0&size=10`

**Parameters**:
- `status`: DRAFT | ISSUED | PAID | OVERDUE | CANCELLED

**Response**: (Paginated list)

### 10.6. Cập Nhật Hóa Đơn
**PUT** `/invoices/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 10.7. Xóa Hóa Đơn
**DELETE** `/invoices/{id}`

**Response** (204 No Content)

### 10.8. Số Lượng Hóa Đơn
**GET** `/invoices/count`

**Response** (200 OK): `156`

---

## 11. Attachment Management (Tệp Đính Kèm)

### 11.1. Tạo Tệp Đính Kèm
**POST** `/attachments`

**Request Body**:
```json
{
  "fileName": "proposal.pdf",
  "fileType": "pdf",
  "fileSize": 2048576,
  "filePath": "/uploads/2026/05/proposal.pdf",
  "relatedToType": "CUSTOMER",
  "relatedToId": 1,
  "uploadedBy": 1
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "fileName": "proposal.pdf",
  "fileType": "pdf",
  "fileSize": 2048576,
  "relatedToType": "CUSTOMER",
  "relatedToId": 1,
  "createdAt": "2026-05-06T10:30:00"
}
```

### 11.2. Lấy Tệp Đính Kèm
**GET** `/attachments/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 11.3. Danh Sách Tệp Đính Kèm Theo Liên Quan
**GET** `/attachments/related/{relatedToType}/{relatedToId}`

**Parameters**:
- `relatedToType`: CUSTOMER | CONTACT | ACTIVITY | TASK | OPPORTUNITY | FEEDBACK | CONTRACT | QUOTE | INVOICE

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "fileName": "proposal.pdf",
    "fileType": "pdf",
    "fileSize": 2048576,
    "relatedToType": "CUSTOMER",
    "relatedToId": 1,
    "createdAt": "2026-05-06T10:30:00"
  }
]
```

### 11.4. Danh Sách Tệp Đính Kèm Theo Liên Quan (Phân Trang)
**GET** `/attachments/related-paginated/{relatedToType}/{relatedToId}?page=0&size=10`

**Response**: (Paginated list)

### 11.5. Cập Nhật Tệp Đính Kèm
**PUT** `/attachments/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 11.6. Xóa Tệp Đính Kèm
**DELETE** `/attachments/{id}`

**Response** (204 No Content)

### 11.7. Xóa Tất Cả Tệp Đính Kèm Theo Liên Quan
**DELETE** `/attachments/related/{relatedToType}/{relatedToId}`

**Response** (204 No Content)

### 11.8. Số Lượng Tệp Đính Kèm
**GET** `/attachments/count`

**Response** (200 OK): `342`

---

## 12. Customer Address Management (Địa Chỉ Khách Hàng)

### 12.1. Tạo Địa Chỉ Khách Hàng
**POST** `/customer-addresses`

**Request Body**:
```json
{
  "customerId": 1,
  "addressType": "HEADQUARTERS",
  "fullAddress": "Số 123, Đường ABC, Quận 1, TP.HCM",
  "provinceId": 79,
  "isPrimary": true
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "customerId": 1,
  "addressType": "HEADQUARTERS",
  "fullAddress": "Số 123, Đường ABC, Quận 1, TP.HCM",
  "provinceId": 79,
  "isPrimary": true,
  "createdAt": "2026-05-06T10:30:00"
}
```

### 12.2. Lấy Địa Chỉ Khách Hàng
**GET** `/customer-addresses/{id}`

**Response** (200 OK): (Tương tự response tạo)

### 12.3. Danh Sách Địa Chỉ Theo Khách Hàng
**GET** `/customer-addresses/customer/{customerId}`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "customerId": 1,
    "addressType": "HEADQUARTERS",
    "fullAddress": "Số 123, Đường ABC, Quận 1, TP.HCM",
    "isPrimary": true,
    "createdAt": "2026-05-06T10:30:00"
  }
]
```

### 12.4. Danh Sách Địa Chỉ Theo Khách Hàng (Phân Trang)
**GET** `/customer-addresses/customer-paginated/{customerId}?page=0&size=10`

**Response**: (Paginated list)

### 12.5. Lấy Địa Chỉ Chính
**GET** `/customer-addresses/primary/{customerId}`

**Response** (200 OK): (Tương tự response tạo hoặc 404)

### 12.6. Cập Nhật Địa Chỉ Khách Hàng
**PUT** `/customer-addresses/{id}`

**Request Body**: (Tương tự tạo)

**Response** (200 OK): (Tương tự tạo)

### 12.7. Xóa Địa Chỉ Khách Hàng
**DELETE** `/customer-addresses/{id}`

**Response** (204 No Content)

### 12.8. Xóa Tất Cả Địa Chỉ Theo Khách Hàng
**DELETE** `/customer-addresses/customer/{customerId}`

**Response** (204 No Content)

### 12.9. Số Lượng Địa Chỉ
**GET** `/customer-addresses/count`

**Response** (200 OK): `289`

---

## 13. Error Handling

### Standard Error Response
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "timestamp": "2026-05-06T10:30:00",
  "details": [
    {
      "field": "email",
      "error": "Email không hợp lệ"
    }
  ]
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | GET thành công |
| 201 | Created | POST thành công |
| 204 | No Content | DELETE thành công |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 404 | Not Found | Resource không tìm thấy |
| 409 | Conflict | Duplicate unique field |
| 500 | Internal Server Error | Lỗi server |

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| VALIDATION_ERROR | Dữ liệu không hợp lệ | Kiểm tra lại request body |
| ENTITY_NOT_FOUND | Entity không tìm thấy | Kiểm tra ID |
| DUPLICATE_ENTRY | Giá trị đã tồn tại | Sử dụng giá trị khác |
| UNAUTHORIZED | Không có quyền | Kiểm tra authentication |
| INTERNAL_ERROR | Lỗi server | Liên hệ admin |

---

## 14. Request/Response Examples

### Example 1: Tạo Khách Hàng & Liên Hệ

**Step 1**: Tạo khách hàng
```bash
POST /api/v1/customers
Content-Type: application/json

{
  "customerName": "Tech Corp",
  "email": "contact@techcorp.com",
  "phone": "0987654321",
  "customerType": "COMPANY",
  "status": "ACTIVE"
}

# Response
{
  "id": 123,
  "customerName": "Tech Corp",
  "email": "contact@techcorp.com",
  "createdAt": "2026-05-06T10:30:00"
}
```

**Step 2**: Tạo liên hệ cho khách hàng
```bash
POST /api/v1/contacts
Content-Type: application/json

{
  "customerId": 123,
  "contactName": "Trần Văn B",
  "email": "tranvanb@techcorp.com",
  "phone": "0912345678",
  "position": "Sales Manager",
  "isPrimary": true
}

# Response
{
  "id": 456,
  "customerId": 123,
  "contactName": "Trần Văn B",
  "email": "tranvanb@techcorp.com",
  "createdAt": "2026-05-06T10:30:00"
}
```

### Example 2: Lấy Danh Sách & Lọc

```bash
# Lấy danh sách khách hàng hoạt động
GET /api/v1/customers/status/ACTIVE?page=0&size=20&sort=createdAt,desc

# Lấy tác vụ khẩn cấp của user
GET /api/v1/tasks/priority/URGENT?page=0&size=10

# Lấy hoạt động của khách hàng
GET /api/v1/activities/customer/123?page=0&size=15

# Lấy hóa đơn chưa thanh toán
GET /api/v1/invoices/status/ISSUED?page=0&size=20
```

### Example 3: Cập Nhật

```bash
PUT /api/v1/customers/123
Content-Type: application/json

{
  "customerName": "Tech Corp Vietnam",
  "status": "INACTIVE"
}

# Response
{
  "id": 123,
  "customerName": "Tech Corp Vietnam",
  "status": "INACTIVE",
  "updatedAt": "2026-05-06T14:30:00"
}
```

---

## 15. Frontend Integration Guide

### Setup Base URL & Interceptors

```typescript
// React / Vue / Angular
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Setup axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    if (response?.status === 404) {
      // Handle not found
    } else if (response?.status === 400) {
      // Handle validation error
      console.error(response.data.details);
    }
    return Promise.reject(error);
  }
);
```

### Service Layer Pattern

```typescript
// customerService.ts
class CustomerService {
  async getCustomers(page = 0, size = 10) {
    return api.get(`/customers?page=${page}&size=${size}`);
  }

  async getCustomerById(id) {
    return api.get(`/customers/${id}`);
  }

  async createCustomer(data) {
    return api.post('/customers', data);
  }

  async updateCustomer(id, data) {
    return api.put(`/customers/${id}`, data);
  }

  async deleteCustomer(id) {
    return api.delete(`/customers/${id}`);
  }

  async getCustomersByStatus(status, page = 0, size = 10) {
    return api.get(`/customers/status/${status}?page=${page}&size=${size}`);
  }
}
```

### Component Usage Example

```typescript
// CustomerList.tsx
function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomers(page, 10);
      setCustomers(response.data.content);
      setTotal(response.data.totalElements);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Danh Sách Khách Hàng</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.customerName}</td>
                <td>{customer.email}</td>
                <td>{customer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination 
        current={page}
        total={Math.ceil(total / 10)}
        onChange={setPage}
      />
    </div>
  );
}
```

---

## 16. Constants & Enums

### Customer Type
- INDIVIDUAL (Cá nhân)
- COMPANY (Công ty)
- GOVERNMENT (Chính phủ)
- OTHER (Khác)

### Status
- ACTIVE (Hoạt động)
- INACTIVE (Không hoạt động)
- LEAD (Dẫu chỉ)
- PROSPECT (Khách hàng tiềm năng)

### Priority
- LOW (Thấp)
- MEDIUM (Trung bình)
- HIGH (Cao)
- URGENT (Khẩn cấp)

### Activity Type
- CALL (Cuộc gọi)
- EMAIL (Email)
- MEETING (Cuộp họp)
- TASK (Tác vụ)
- OTHER (Khác)

### Health Status
- ON_TRACK (Đúng tiến độ)
- AT_RISK (Có rủi ro)
- NEEDS_ATTENTION (Cần chú ý)
- LOST (Mất)

---

## 17. Notes & Best Practices

1. **Always validate input** trước khi gửi request
2. **Use proper HTTP methods**: GET (read), POST (create), PUT (update), DELETE (delete)
3. **Implement error handling** cho tất cả requests
4. **Paginate large datasets** - không lấy toàn bộ dữ liệu cùng lúc
5. **Cache responses** khi có thể để giảm load
6. **Use unique IDs** khi updating/deleting
7. **Handle loading states** trong UI
8. **Implement soft delete awareness** - deleted data vẫn ở database nhưng có deletedAt timestamp
9. **Use sort parameters** để sắp xếp dữ liệu theo ý muốn
10. **Monitor API rate limits** nếu có

---

## 18. Contact & Support

- **API Documentation**: Xem file này
- **Backend Admin**: Liên hệ team backend
- **Environment Variables**: Sử dụng `.env` file
- **Production API URL**: https://api.crm.company.com/api/v1

---

**Version History**:
- v1.0 (2026-05-06): Initial documentation - 9 modules, 70+ endpoints
