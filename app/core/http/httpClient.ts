import axios from "axios";

const httpClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

httpClient.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message =
            error.response?.data?.message ||
            "Có lỗi xảy ra";

        return Promise.reject({
            status,
            message,
        });
    }
);

export default httpClient;