// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { loginUseCase } from "../useCases/login";
// import { tokenService } from "@/core/auth/token.service";
// import { LoginRequest } from "../types/auth.type";

// export const useLogin = () => {
//     const router = useRouter();

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const login = async (payload: LoginRequest) => {
//         try {
//             setLoading(true);
//             setError("");

//             const response = await loginUseCase(payload);

//             tokenService.save(response);

//             router.push("/leads");
//         } catch (err: any) {
//             setError(
//                 err?.response?.data?.message ||
//                 "Tên đăng nhập hoặc mật khẩu không đúng"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return {
//         login,
//         loading,
//         error,
//     };
// };


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { loginUseCase } from "../useCases/login";
// import { tokenService } from "@/core/auth/token.service";
// import { LoginRequest } from "../types/auth.type";

// const getDefaultRoute = (roles: string[]) => {
//     if (roles.includes("IT")) {
//         return "/system/users";
//     }

//     if (roles.includes("SALE_MANAGER")) {
//         return "/leads";
//     }

//     if (roles.includes("SALE_EMPLOYEE")) {
//         return "/customers";
//     }

//     return "/dashboard";
// };

// export const useLogin = () => {
//     const router = useRouter();

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const login = async (payload: LoginRequest) => {
//         try {
//             setLoading(true);
//             setError("");

//             const response = await loginUseCase(payload);

//             tokenService.save(response);

//             const redirectPath = getDefaultRoute(response.roles);

//             router.replace(redirectPath);
//         } catch (err: any) {
//             setError(
//                 err?.response?.data?.message ||
//                 "Tên đăng nhập hoặc mật khẩu không chính xác"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return {
//         login,
//         loading,
//         error,
//     };
// };


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { loginApi } from "../api/auth.api";
// import { LoginRequest } from "../types/auth.type";

// export const useLogin = () => {
//     const router = useRouter();

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const login = async (payload: LoginRequest) => {
//         try {
//             setLoading(true);
//             setError("");

//             const response = await loginApi(payload);

//             // Lưu JWT
//             localStorage.setItem(
//                 "accessToken",
//                 response.accessToken
//             );

//             localStorage.setItem(
//                 "refreshToken",
//                 response.refreshToken
//             );

//             // Lưu thông tin user
//             localStorage.setItem(
//                 "username",
//                 response.username
//             );

//             // localStorage.setItem(
//             //     "role",
//             //     response.roles[0]
//             // );
//             localStorage.setItem(
//                 "roles",
//                 JSON.stringify(response.roles)
//             );

//             localStorage.setItem("fullName", response.fullName);

//             // Chuyển trang theo role
//             const role = response.roles[0];

//             switch (role) {
//                 case "ADMIN":
//                     router.push("/system/organizations");
//                     break;
//                 case "IT":
//                     router.push("/system/users");
//                     break;
//                 case "SALE_MANAGER":
//                 case "SALES":
//                     router.push("/leads");
//                     break;

//                 default:
//                     router.push("/");
//             }
//         } catch (err: any) {
//             setError(
//                 err.response?.data?.message ||
//                 "Đăng nhập thất bại"
//             );
//             throw err;
//         } finally {
//             setLoading(false);
//         }
//     };

//     return {
//         login,
//         loading,
//         error,
//     };
// };

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

import { loginApi } from "../api/auth.api";
import { LoginRequest } from "../types/auth.type";

export const useLogin = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async (payload: LoginRequest) => {
        try {
            setLoading(true);
            setError("");

            const response = await loginApi(payload);

            // Lưu JWT
            localStorage.setItem(
                "accessToken",
                response.accessToken
            );

            localStorage.setItem(
                "refreshToken",
                response.refreshToken
            );

            // Lưu thông tin user

            localStorage.setItem(
                "userId",
                response.userId.toString()
            );
            
            localStorage.setItem(
                "username",
                response.username
            );

            localStorage.setItem(
                "roles",
                JSON.stringify(response.roles)
            );

            localStorage.setItem(
                "fullName",
                response.fullName
            );

            localStorage.setItem(
                "scope",
                response.scope
            );

            // Chuyển trang theo role
            const role = response.roles[0];

            switch (role) {
                case "ADMIN":
                    router.push("/system/organizations");
                    break;

                case "IT":
                    router.push("/system/users");
                    break;

                case "SALE_MANAGER":
                case "SALES":
                    router.push("/leads");
                    break;

                default:
                    router.push("/");
            }

            return response;
        } catch (err) {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    setError("Sai tài khoản hoặc mật khẩu");
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Đăng nhập thất bại"
                    );
                }
            } else {
                setError("Có lỗi xảy ra");
            }

            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error,
    };
};