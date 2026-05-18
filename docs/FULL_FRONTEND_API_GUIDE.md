# Toàn bộ Tài liệu API Modules Customers (Frontend Guide)

> **Lưu ý**: Đây là tài liệu được gen tự động từ mã nguồn Java Backend, phản ánh chính xác cấu trúc DTO và Endpoints thực tế.

## I. Export Types (TypeScript Interfaces)

```typescript
export interface PageResponse<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
```

## II. Endpoints (Controllers)

### Activity API

**Base Path:** `/api/activities`

#### createActivity
- **Method:** `POST`
- **URL:** `/api/activities`
- **Body:** `CreateActivityDTO`
- **Response:** `ActivityResponseDTO`

#### getActivityById
- **Method:** `GET`
- **URL:** `/api/activities/{id}`
- **Response:** `ActivityResponseDTO`

#### getActivitiesByCustomer
- **Method:** `GET`
- **URL:** `/api/activities/customer/{customerId}`
- **Response:** `PageResponse<ActivityResponseDTO>`

#### getActivitiesByUser
- **Method:** `GET`
- **URL:** `/api/activities/user/{userId}`
- **Response:** `PageResponse<ActivityResponseDTO>`

#### getActivitiesByType
- **Method:** `GET`
- **URL:** `/api/activities/type/{activityType}`
- **Response:** `PageResponse<ActivityResponseDTO>`

#### updateActivity
- **Method:** `PUT`
- **URL:** `/api/activities/{id}`
- **Response:** `ActivityResponseDTO`

#### deleteActivity
- **Method:** `DELETE`
- **URL:** `/api/activities/{id}`
- **Response:** `Void`

#### countActivities
- **Method:** `GET`
- **URL:** `/api/activities/count`
- **Response:** `Long`

### Attachment API

**Base Path:** `/api/attachments`

#### createAttachment
- **Method:** `POST`
- **URL:** `/api/attachments`
- **Body:** `CreateAttachmentDTO`
- **Response:** `AttachmentResponseDTO`

#### getAttachmentById
- **Method:** `GET`
- **URL:** `/api/attachments/{id}`
- **Response:** `AttachmentResponseDTO`

#### getAttachmentsByRelatedTo
- **Method:** `GET`
- **URL:** `/api/attachments/related/{relatedToType}/{relatedToId}`
- **Response:** `Array<AttachmentResponseDTO>`

#### getAttachmentsByRelatedToPaginated
- **Method:** `GET`
- **URL:** `/api/attachments/related-paginated/{relatedToType}/{relatedToId}`
- **Response:** `PageResponse<AttachmentResponseDTO>`

#### updateAttachment
- **Method:** `PUT`
- **URL:** `/api/attachments/{id}`
- **Response:** `AttachmentResponseDTO`

#### deleteAttachment
- **Method:** `DELETE`
- **URL:** `/api/attachments/{id}`
- **Response:** `Void`

#### deleteAttachmentsByRelatedTo
- **Method:** `DELETE`
- **URL:** `/api/attachments/related/{relatedToType}/{relatedToId}`
- **Response:** `Void`

#### countAttachments
- **Method:** `GET`
- **URL:** `/api/attachments/count`
- **Response:** `Long`

### Contact API

**Base Path:** `/api/contacts`

#### createContact
- **Method:** `POST`
- **URL:** `/api/contacts/customer/{customerId}`
- **Response:** `ContactResponseDTO`

#### getContactById
- **Method:** `GET`
- **URL:** `/api/contacts/{id}`
- **Response:** `ContactResponseDTO`

#### updateContact
- **Method:** `PUT`
- **URL:** `/api/contacts/{id}`
- **Response:** `ContactResponseDTO`

#### deleteContact
- **Method:** `DELETE`
- **URL:** `/api/contacts/{id}`
- **Response:** `Void`

#### getContactsByCustomer
- **Method:** `GET`
- **URL:** `/api/contacts/customer/{customerId}`
- **Response:** `Array<ContactResponseDTO>`

#### getContactsByCustomerPaginated
- **Method:** `GET`
- **URL:** `/api/contacts/customer/{customerId}/page`
- **Response:** `PageResponse<ContactResponseDTO>`

#### getPrimaryContact
- **Method:** `GET`
- **URL:** `/api/contacts/customer/{customerId}/primary`
- **Response:** `ContactResponseDTO`

#### setPrimaryContact
- **Method:** `PATCH`
- **URL:** `/api/contacts/{id}/set-primary`
- **Response:** `Void`

#### deleteAllContactsByCustomer
- **Method:** `DELETE`
- **URL:** `/api/contacts/customer/{customerId}`
- **Response:** `Void`

#### getTotalContactsCount
- **Method:** `GET`
- **URL:** `/api/contacts/customer/{customerId}/count`
- **Response:** `Long`

### Contract API

**Base Path:** `/api/contracts`

#### createContract
- **Method:** `POST`
- **URL:** `/api/contracts`
- **Body:** `CreateContractDTO`
- **Response:** `ContractResponseDTO`

#### getContractById
- **Method:** `GET`
- **URL:** `/api/contracts/{id}`
- **Response:** `ContractResponseDTO`

#### getContractByCode
- **Method:** `GET`
- **URL:** `/api/contracts/code/{contractCode}`
- **Response:** `?`

#### getContractsByCustomer
- **Method:** `GET`
- **URL:** `/api/contracts/customer/{customerId}`
- **Response:** `PageResponse<ContractResponseDTO>`

#### getContractsByStatus
- **Method:** `GET`
- **URL:** `/api/contracts/status/{status}`
- **Response:** `PageResponse<ContractResponseDTO>`

#### updateContract
- **Method:** `PUT`
- **URL:** `/api/contracts/{id}`
- **Response:** `ContractResponseDTO`

#### deleteContract
- **Method:** `DELETE`
- **URL:** `/api/contracts/{id}`
- **Response:** `Void`

#### countContracts
- **Method:** `GET`
- **URL:** `/api/contracts/count`
- **Response:** `Long`

### CustomerAddress API

**Base Path:** `/api/customer-addresses`

#### createCustomerAddress
- **Method:** `POST`
- **URL:** `/api/customer-addresses`
- **Body:** `CreateCustomerAddressDTO`
- **Response:** `CustomerAddressResponseDTO`

#### getCustomerAddressById
- **Method:** `GET`
- **URL:** `/api/customer-addresses/{id}`
- **Response:** `CustomerAddressResponseDTO`

#### getAddressesByCustomer
- **Method:** `GET`
- **URL:** `/api/customer-addresses/customer/{customerId}`
- **Response:** `Array<CustomerAddressResponseDTO>`

#### getAddressesByCustomerPaginated
- **Method:** `GET`
- **URL:** `/api/customer-addresses/customer-paginated/{customerId}`
- **Response:** `PageResponse<CustomerAddressResponseDTO>`

#### getPrimaryAddress
- **Method:** `GET`
- **URL:** `/api/customer-addresses/primary/{customerId}`
- **Response:** `?`

#### updateCustomerAddress
- **Method:** `PUT`
- **URL:** `/api/customer-addresses/{id}`
- **Response:** `CustomerAddressResponseDTO`

#### deleteCustomerAddress
- **Method:** `DELETE`
- **URL:** `/api/customer-addresses/{id}`
- **Response:** `Void`

#### deleteAddressesByCustomer
- **Method:** `DELETE`
- **URL:** `/api/customer-addresses/customer/{customerId}`
- **Response:** `Void`

#### countAddresses
- **Method:** `GET`
- **URL:** `/api/customer-addresses/count`
- **Response:** `Long`

### Customer API

**Base Path:** `/api/customers`

#### createCustomer
- **Method:** `POST`
- **URL:** `/api/customers`
- **Body:** `CreateCustomerDTO`
- **Response:** `CustomerResponseDTO`

#### getCustomerById
- **Method:** `GET`
- **URL:** `/api/customers/{id}`
- **Response:** `CustomerResponseDTO`

#### updateCustomer
- **Method:** `PUT`
- **URL:** `/api/customers/{id}`
- **Response:** `CustomerResponseDTO`

#### deleteCustomer
- **Method:** `DELETE`
- **URL:** `/api/customers/{id}`
- **Response:** `Void`

#### getAllCustomers
- **Method:** `GET`
- **URL:** `/api/customers`
- **Response:** `PageResponse<CustomerResponseDTO>`

#### getB2BCustomers
- **Method:** `GET`
- **URL:** `/api/customers/type/b2b`
- **Response:** `PageResponse<CustomerResponseDTO>`

#### getB2CCustomers
- **Method:** `GET`
- **URL:** `/api/customers/type/b2c`
- **Response:** `PageResponse<CustomerResponseDTO>`

#### findByEmail
- **Method:** `GET`
- **URL:** `/api/customers/search/email`
- **Response:** `CustomerResponseDTO`

#### findByCustomerCode
- **Method:** `GET`
- **URL:** `/api/customers/search/code`
- **Response:** `CustomerResponseDTO`

#### getCustomersByAssignedUser
- **Method:** `GET`
- **URL:** `/api/customers/assigned/{userId}`
- **Response:** `PageResponse<CustomerResponseDTO>`

#### getCustomersByStatus
- **Method:** `GET`
- **URL:** `/api/customers/status/{statusId}`
- **Response:** `PageResponse<CustomerResponseDTO>`

#### getCustomersByTier
- **Method:** `GET`
- **URL:** `/api/customers/tier/{tierId}`
- **Response:** `PageResponse<CustomerResponseDTO>`

#### updateCustomerStatus
- **Method:** `PATCH`
- **URL:** `/api/customers/{id}/status`
- **Response:** `Void`

#### updateCustomerTier
- **Method:** `PATCH`
- **URL:** `/api/customers/{id}/tier`
- **Response:** `Void`

#### assignCustomerToUser
- **Method:** `PATCH`
- **URL:** `/api/customers/{id}/assign`
- **Response:** `Void`

#### getTotalCustomersCount
- **Method:** `GET`
- **URL:** `/api/customers/count`
- **Response:** `Long`

### Feedback API

**Base Path:** `/api/feedbacks`

#### createFeedback
- **Method:** `POST`
- **URL:** `/api/feedbacks`
- **Body:** `CreateFeedbackDTO`
- **Response:** `FeedbackResponseDTO`

#### getFeedbackById
- **Method:** `GET`
- **URL:** `/api/feedbacks/{id}`
- **Response:** `FeedbackResponseDTO`

#### getFeedbacksByCustomer
- **Method:** `GET`
- **URL:** `/api/feedbacks/customer/{customerId}`
- **Response:** `PageResponse<FeedbackResponseDTO>`

#### getFeedbacksByStatus
- **Method:** `GET`
- **URL:** `/api/feedbacks/status/{status}`
- **Response:** `PageResponse<FeedbackResponseDTO>`

#### getFeedbacksByPriority
- **Method:** `GET`
- **URL:** `/api/feedbacks/priority/{priority}`
- **Response:** `PageResponse<FeedbackResponseDTO>`

#### updateFeedback
- **Method:** `PUT`
- **URL:** `/api/feedbacks/{id}`
- **Response:** `FeedbackResponseDTO`

#### deleteFeedback
- **Method:** `DELETE`
- **URL:** `/api/feedbacks/{id}`
- **Response:** `Void`

#### countFeedbacks
- **Method:** `GET`
- **URL:** `/api/feedbacks/count`
- **Response:** `Long`

### Invoice API

**Base Path:** `/api/invoices`

#### createInvoice
- **Method:** `POST`
- **URL:** `/api/invoices`
- **Body:** `CreateInvoiceDTO`
- **Response:** `InvoiceResponseDTO`

#### getInvoiceById
- **Method:** `GET`
- **URL:** `/api/invoices/{id}`
- **Response:** `InvoiceResponseDTO`

#### getInvoiceByCode
- **Method:** `GET`
- **URL:** `/api/invoices/code/{invoiceCode}`
- **Response:** `?`

#### getInvoicesByCustomer
- **Method:** `GET`
- **URL:** `/api/invoices/customer/{customerId}`
- **Response:** `PageResponse<InvoiceResponseDTO>`

#### getInvoicesByStatus
- **Method:** `GET`
- **URL:** `/api/invoices/status/{status}`
- **Response:** `PageResponse<InvoiceResponseDTO>`

#### updateInvoice
- **Method:** `PUT`
- **URL:** `/api/invoices/{id}`
- **Response:** `InvoiceResponseDTO`

#### deleteInvoice
- **Method:** `DELETE`
- **URL:** `/api/invoices/{id}`
- **Response:** `Void`

#### countInvoices
- **Method:** `GET`
- **URL:** `/api/invoices/count`
- **Response:** `Long`

### Opportunity API

**Base Path:** `/api/opportunities`

#### createOpportunity
- **Method:** `POST`
- **URL:** `/api/opportunities`
- **Body:** `CreateOpportunityDTO`
- **Response:** `OpportunityResponseDTO`

#### getOpportunityById
- **Method:** `GET`
- **URL:** `/api/opportunities/{id}`
- **Response:** `OpportunityResponseDTO`

#### getOpportunitiesByCustomer
- **Method:** `GET`
- **URL:** `/api/opportunities/customer/{customerId}`
- **Response:** `PageResponse<OpportunityResponseDTO>`

#### getOpportunitiesByAssignedUser
- **Method:** `GET`
- **URL:** `/api/opportunities/user/{userId}`
- **Response:** `PageResponse<OpportunityResponseDTO>`

#### getOpportunitiesByHealthStatus
- **Method:** `GET`
- **URL:** `/api/opportunities/status/{healthStatus}`
- **Response:** `PageResponse<OpportunityResponseDTO>`

#### updateOpportunity
- **Method:** `PUT`
- **URL:** `/api/opportunities/{id}`
- **Response:** `OpportunityResponseDTO`

#### deleteOpportunity
- **Method:** `DELETE`
- **URL:** `/api/opportunities/{id}`
- **Response:** `Void`

#### countOpportunities
- **Method:** `GET`
- **URL:** `/api/opportunities/count`
- **Response:** `Long`

### Quote API

**Base Path:** `/api/quotes`

#### createQuote
- **Method:** `POST`
- **URL:** `/api/quotes`
- **Body:** `CreateQuoteDTO`
- **Response:** `QuoteResponseDTO`

#### getQuoteById
- **Method:** `GET`
- **URL:** `/api/quotes/{id}`
- **Response:** `QuoteResponseDTO`

#### getQuoteByCode
- **Method:** `GET`
- **URL:** `/api/quotes/code/{quoteCode}`
- **Response:** `?`

#### getQuotesByCustomer
- **Method:** `GET`
- **URL:** `/api/quotes/customer/{customerId}`
- **Response:** `PageResponse<QuoteResponseDTO>`

#### getQuotesByStatus
- **Method:** `GET`
- **URL:** `/api/quotes/status/{status}`
- **Response:** `PageResponse<QuoteResponseDTO>`

#### updateQuote
- **Method:** `PUT`
- **URL:** `/api/quotes/{id}`
- **Response:** `QuoteResponseDTO`

#### deleteQuote
- **Method:** `DELETE`
- **URL:** `/api/quotes/{id}`
- **Response:** `Void`

#### countQuotes
- **Method:** `GET`
- **URL:** `/api/quotes/count`
- **Response:** `Long`

### Task API

**Base Path:** `/api/tasks`

#### createTask
- **Method:** `POST`
- **URL:** `/api/tasks`
- **Body:** `CreateTaskDTO`
- **Response:** `TaskResponseDTO`

#### getTaskById
- **Method:** `GET`
- **URL:** `/api/tasks/{id}`
- **Response:** `TaskResponseDTO`

#### getTasksByCustomer
- **Method:** `GET`
- **URL:** `/api/tasks/customer/{customerId}`
- **Response:** `PageResponse<TaskResponseDTO>`

#### getTasksByAssignedUser
- **Method:** `GET`
- **URL:** `/api/tasks/user/{userId}`
- **Response:** `PageResponse<TaskResponseDTO>`

#### getTasksByStatus
- **Method:** `GET`
- **URL:** `/api/tasks/status/{status}`
- **Response:** `PageResponse<TaskResponseDTO>`

#### getTasksByPriority
- **Method:** `GET`
- **URL:** `/api/tasks/priority/{priority}`
- **Response:** `PageResponse<TaskResponseDTO>`

#### updateTask
- **Method:** `PUT`
- **URL:** `/api/tasks/{id}`
- **Response:** `TaskResponseDTO`

#### deleteTask
- **Method:** `DELETE`
- **URL:** `/api/tasks/{id}`
- **Response:** `Void`

#### countTasks
- **Method:** `GET`
- **URL:** `/api/tasks/count`
- **Response:** `Long`

