import { menuApi } from "../api/menu.api";

export const deleteMenu = async (id: number) => {
  return await menuApi.delete(id);
};