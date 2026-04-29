import axios from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type ApiHttpError = {
  status?: number;
  message: string;
  data?: unknown;
};

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError: ApiHttpError = {
      status: error?.response?.status,
      data: error?.response?.data,
      message:
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        "Unexpected error",
    };

    return Promise.reject(normalizedError);
  }
);
