import { userApi } from "../api/user.api";
import { UserPayload } from "../types/user.type";

export const createUser = (payload: UserPayload) =>
    userApi.create(payload);