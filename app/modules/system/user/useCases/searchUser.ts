// File: modules/system/user/useCases/searchUsers.ts

import { userApi } from "../api/user.api";
import {
    UserFilter,
    UserPageResponse,
} from "../types/user.type";

export const searchUsers = async (
    filters: UserFilter
): Promise<UserPageResponse> => {
    return await userApi.search(filters);
};