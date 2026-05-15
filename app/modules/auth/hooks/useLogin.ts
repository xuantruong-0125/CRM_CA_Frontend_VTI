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


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
                "username",
                response.username
            );

            if (response.userId) {
                localStorage.setItem("userId", response.userId.toString());
            }
            if (response.orgId) {
                localStorage.setItem("orgId", response.orgId.toString());
            }

            // localStorage.setItem(
            //     "role",
            //     response.roles[0]
            // );
            localStorage.setItem(
                "roles",
                JSON.stringify(response.roles)
            );

            localStorage.setItem("fullName", response.fullName);

            // Chuyển trang theo role
            const role = response.roles[0];

            switch (role) {
                case "ADMIN":
                    router.push("/system/organizations");
                    break;
                case "IT":
                    router.push("/system/users");
                    break;
                case "MANAGER":
                    router.push("/reports");
                    break;
                case "SALE":
                    router.push("/my-kpi");
                    break;

                default:
                    router.push("/");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Đăng nhập thất bại"
            );
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