export type ISODateTimeString = string;

export type SortDirection = "asc" | "desc";

export type CustomerType = "B2B" | "B2C";

export type CustomerStatus = "CARING" | "PAUSED" | "BLACKLIST" | "OTHER";

export type CustomerTier = "SILVER" | "GOLD" | "DIAMOND";

export type CustomerClassification = CustomerTier;

export interface CustomerSaleUserResponseDTO {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  organizationId: number;
  status: string;
  lastLogin?: ISODateTimeString | null;
  createdAt?: ISODateTimeString;
}

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

export interface CustomerListQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  q?: string;
  customerType?: CustomerType;
  status?: CustomerStatus;
  tier?: CustomerTier;
}

export interface CreateCustomerDTO {
  name: string;
  type: CustomerType;
  phone: string;
  email?: string;
  taxCode?: string;
  shortName?: string;
  fax?: string;
  description?: string;
  establishedDate?: ISODateTimeString;
  sourceId?: number;
  statusId?: number;
  tierId?: number;
  assignedTo?: number;
}

export interface UpdateCustomerDTO {
  name?: string;
  shortName?: string;
  phone?: string;
  email?: string;
  fax?: string;
  description?: string;
  establishedDate?: ISODateTimeString;
  sourceId?: number;
  statusId?: number;
  tierId?: number;
  assignedTo?: number;
}

export interface CustomerResponseDTO {
  id: number;
  customerCode: string;
  type: CustomerType;
  name: string;
  shortName?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  fax?: string;
  description?: string;
  establishedDate?: ISODateTimeString;
  sourceId?: number;
  statusName?: string;
  tierName?: string;
  assignedTo?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateCustomerAddressDTO {
  customerId: number;
  addressType: string;
  fullAddress: string;
  provinceId?: number;
  isPrimary?: boolean;
}

export interface CustomerAddressResponseDTO {
  id: number;
  customerId: number;
  addressType: string;
  fullAddress: string;
  provinceId?: number;
  isPrimary: boolean;
}

export interface CreateContactDTO {
  customerId: number;
  fullName: string;
  phone?: string;
  email?: string;
  position?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface ContactResponseDTO {
  id: number;
  customerId: number;
  fullName: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
  isPrimary?: boolean;
  createdAt?: ISODateTimeString;
}

export interface CreateOpportunityDTO {
  name: string;
  customerId: number;
  pipelineId?: number;
  stageId?: number;
  totalAmount?: number;
  depositAmount?: number;
  remainingAmount?: number;
  currencyCode?: string;
  exchangeRate?: number;
  expectedCloseDate?: string;
  lossReasonId?: number;
  healthStatus?: string;
  assignedUserId?: number;
}

export interface OpportunityResponseDTO {
  id: number;
  name: string;
  customerId: number;
  pipelineId?: number;
  pipelineName?: string;
  stageId?: number;
  stageName?: string;
  totalAmount?: number;
  depositAmount?: number;
  remainingAmount?: number;
  currencyCode?: string;
  exchangeRate?: number;
  expectedCloseDate?: string;
  lossReasonId?: number;
  lossReasonName?: string;
  healthStatus?: string;
  assignedUserId?: number;
  assignedUserFullName?: string;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateQuoteDTO {
  customerId: number;
  quoteName: string;
  quoteCode?: string;
  quoteDate?: string;
  validUntil?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  status?: string;
  notes?: string;
  templateId?: number;
}

export interface QuoteResponseDTO {
  id: number;
  customerId: number;
  quoteCode?: string;
  quoteName: string;
  quoteDate?: string;
  validUntil?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  status?: string;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateContractDTO {
  customerId: number;
  contractName: string;
  contractCode?: string;
  startDate?: string;
  endDate?: string;
  totalValue?: number;
  status?: string;
  templateId?: number;
}

export interface ContractResponseDTO {
  id: number;
  customerId: number;
  contractCode?: string;
  contractName: string;
  startDate?: string;
  endDate?: string;
  totalValue?: number;
  status?: string;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateInvoiceDTO {
  customerId: number;
  invoiceName: string;
  invoiceCode?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotalAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  paymentMethod?: string;
  notes?: string;
  templateId?: number;
}

export interface InvoiceResponseDTO {
  id: number;
  customerId: number;
  invoiceCode?: string;
  invoiceName: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotalAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  paymentMethod?: string;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateActivityDTO {
  activityType: string;
  subject: string;
  description?: string;
  startDate?: ISODateTimeString;
  endDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  outcome?: string;
  relatedToType?: string;
  relatedToId?: number;
  performedBy?: number;
  isImportant?: boolean;
  status?: number;
}

export interface ActivityResponseDTO {
  id: number;
  activityType: string;
  subject: string;
  description?: string;
  startDate?: ISODateTimeString;
  endDate?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  outcome?: string;
  relatedToType?: string;
  relatedToId?: number;
  performedBy?: number | { id: number; fullName?: string; name?: string; email?: string };
  createdBy?: number | { id: number; fullName?: string; email?: string };
  updatedBy?: number | { id: number; fullName?: string; email?: string };
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  status?: number;
  isImportant?: boolean;
}

export interface CreateFeedbackDTO {
  customerId: number;
  subject: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: number;
}

export interface FeedbackResponseDTO {
  id: number;
  customerId: number;
  subject: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateAttachmentDTO {
  fileName: string;
  fileType?: string;
  fileSize?: number;
  filePath: string;
  relatedToType: string;
  relatedToId: number;
  uploadedBy?: number;
}

export interface UploadAttachmentResponseDTO {
  fileName: string;
  fileType?: string;
  fileSize?: number;
  filePath: string;
}

export type UploadAttachmentProgressHandler = (progress: number) => void;

export type UploadCustomerAttachmentRequest = {
  customerId: number;
  file: File;
  uploadedBy: number;
  onProgress?: UploadAttachmentProgressHandler;
};

export interface AttachmentResponseDTO {
  id: number;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  filePath: string;
  relatedToType: string;
  relatedToId: number;
  uploadedBy?: number;
  createdAt?: ISODateTimeString;
}

export interface CreateTaskDTO {
  subject: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: ISODateTimeString;
  status?: string;
  priority?: string;
  progressPercent?: number;
  relatedToType?: string;
  relatedToId?: number;
  assignedTo?: number;
  assignedBy?: number;
  contactId?: number;
}

export interface TaskResponseDTO {
  id: number;
  subject: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: ISODateTimeString;
  status?: string;
  priority?: string;
  progressPercent?: number;
  relatedToType?: string;
  relatedToId?: number;
  assignedTo?: number;
  assignedBy?: number;
  contactId?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface NoteResponseDTO {
  id: number;
  content: string;
  notableType: string;
  notableId: number;
  privateNote: boolean;
  createdBy?: number;
  creatorName?: string;
  createdDate?: ISODateTimeString;
}

export type CreateCustomerRequest = CreateCustomerDTO;
export type UpdateCustomerRequest = UpdateCustomerDTO;
export type CustomerResponse = CustomerResponseDTO;
export type CustomerPageResponse<T> = PageResponse<T>;
export type CustomerAddressResponse = CustomerAddressResponseDTO;
export type CustomerContactResponse = ContactResponseDTO;
export type CustomerOpportunityResponse = OpportunityResponseDTO;
export type CustomerQuoteResponse = QuoteResponseDTO;
export type CustomerContractResponse = ContractResponseDTO;
export type CustomerInvoiceResponse = InvoiceResponseDTO;
export type CustomerActivityResponse = ActivityResponseDTO;
export type CustomerFeedbackResponse = FeedbackResponseDTO;
export type CustomerAttachmentResponse = AttachmentResponseDTO;