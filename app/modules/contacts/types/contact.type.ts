export interface Contact {
  id: number;
  fullName: string;
  position: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  notes: string;
  isPrimary: boolean;
  isActive: boolean;
  customerId: number | null;
  customerName: string | null;
}

export interface CreateContactRequest {
  fullName: string;
  position: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  notes: string;
  isPrimary: boolean;
  isActive: boolean;
  customerId: number | null;
}

export interface UpdateContactRequest {
  fullName: string;
  position: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  notes: string;
  isPrimary: boolean;
  isActive: boolean;
  customerId: number | null;
}

export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  shortName: string;
  type: 'B2B' | 'B2C';
}
