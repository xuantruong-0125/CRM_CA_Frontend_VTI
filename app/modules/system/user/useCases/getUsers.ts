// import { userApi } from "../api/user.api";

// export const getUsers = () => userApi.getAll();


// useCases/getUsers.ts
import { userApi } from "../api/user.api";
import { UserPageResponse } from "../types/user.type";

export const getUsers = async (
    page: number = 0
): Promise<UserPageResponse> => {
    return await userApi.getAll(page);
};