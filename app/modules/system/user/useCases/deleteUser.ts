import { userApi } from "../api/user.api";

export const deleteUser = (id: number) => userApi.delete(id);