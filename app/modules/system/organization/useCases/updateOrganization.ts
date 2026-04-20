import { organizationApi } from '../api/organization.api';
import { OrganizationPayload } from '../types/organization.type';

export const updateOrganization = async (
  id: number,
  data: OrganizationPayload
) => {
  return await organizationApi.update(id, data);
};