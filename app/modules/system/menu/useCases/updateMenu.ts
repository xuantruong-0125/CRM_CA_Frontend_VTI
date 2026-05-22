import { menuApi } from '../api/menu.api';
import { MenuPayload } from '../types/menu.type';

export const updateMenu= async (
  id: number,
  data: MenuPayload
) => {
  return await menuApi.update(id, data);
};