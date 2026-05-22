import { menuApi } from "../api/menu.api";

export const getMenuTree = async () => {
  return await menuApi.getTree();
};