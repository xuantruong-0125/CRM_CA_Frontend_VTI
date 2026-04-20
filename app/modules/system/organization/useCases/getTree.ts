// useCases/getTree.ts
import { organizationApi } from '../api/organization.api';

export const getTree = async () => {
  return await organizationApi.getTree();
};