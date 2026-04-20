import { organizationApi } from '../api/organization.api';

export const deleteOrganization = async (id: number) => {
  return await organizationApi.delete(id);
};