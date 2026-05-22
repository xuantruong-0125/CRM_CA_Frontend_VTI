import { roleApi } from "../api/role.api";

export const getRoles = async () => {
  return await roleApi.getAll();
};