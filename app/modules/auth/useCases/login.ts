import { loginApi } from "../api/auth.api";
import { LoginRequest } from "../types/auth.type";

export const loginUseCase = async (payload: LoginRequest) => {
    return await loginApi(payload);
};