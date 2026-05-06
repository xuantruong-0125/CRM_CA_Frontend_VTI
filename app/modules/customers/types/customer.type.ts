import { Contact } from "../../contacts/types/contact.type";

export interface Customer {
  id: number;
  parentId: number | null;
  customerCode: string;
  type: 'B2B' | 'B2C';
  name: string;
  shortName: string;
  taxCode: string;
  phone: string;
  email: string;
  fax: string;
  establishedDate: string;
  description: string;
  sourceId: number | null;
  statusId: number | null;
  tierId: number | null;
  assignedTo: number | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contacts?: Contact[];
}

export interface CreateCustomerRequest {
  parentId?: number | null;
  customerCode: string;
  type: 'B2B' | 'B2C';
  name: string;
  shortName?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  fax?: string;
  establishedDate?: string;
  description?: string;
  sourceId?: number | null;
  statusId?: number | null;
  tierId?: number | null;
  assignedTo?: number | null;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}
