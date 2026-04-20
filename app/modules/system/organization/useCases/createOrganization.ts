import { organizationApi } from '../api/organization.api';
import { OrganizationPayload } from '../types/organization.type';

export const createOrganization = async (data: OrganizationPayload) => {
  return await organizationApi.create(data);
};