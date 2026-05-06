import { menuApi } from '../api/menu.api';
import { MenuPayload } from '../types/menu.type';

export const createMenu= async (data: MenuPayload) => {
  return await menuApi.create(data);
};