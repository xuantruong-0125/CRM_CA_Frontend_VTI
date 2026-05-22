import { userApi } from "../api/user.api";
import { UserPayload } from "../types/user.type";

// export const updateUser = (id: number, payload: UserPayload) =>
//     userApi.update(id, payload);

export const updateUser = (
    id: number,
    payload: UserPayload
) => {
    return userApi.update(id, payload); // 🔥 phải return
};