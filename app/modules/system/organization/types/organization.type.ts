// types/organization.type.ts

export type OrganizationType =
  | 'COMPANY'
  | 'BRANCH'
  | 'DEPARTMENT'
  | 'TEAM';

export interface Organization {
  id: number;
  name: string;
  parentId: number | null;
  type: OrganizationType;
  children: Organization[];
}

// ✅ thêm cái này
export interface OrganizationPayload {
  name: string;
  parentId: number | null;
  type: OrganizationType;
}