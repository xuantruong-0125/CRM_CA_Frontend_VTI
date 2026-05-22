import { roleApi } from "../api/role.api";

export const deleteRole = async (id: number) => {
  return await roleApi.delete(id);
};