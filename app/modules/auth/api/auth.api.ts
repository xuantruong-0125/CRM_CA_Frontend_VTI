import axios from "axios";
import { LoginRequest, LoginResponse } from "../types/auth.type";

const API_URL = "http://localhost:8080/auth";

export const loginApi = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
        `${API_URL}/login`,
        payload
    );
    return response.data;
};