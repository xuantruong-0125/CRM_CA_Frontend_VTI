// "use client";

// import { useState } from "react";
// import { useLogin } from "./hooks/useLogin";
// import styles from "./styles/login.module.css";

// export default function LoginPage() {
//     const { login, loading, error } = useLogin();

//     const [formData, setFormData] = useState({
//         username: "",
//         password: "",
//     });

//     const handleChange = (
//         e: React.ChangeEvent<HTMLInputElement>
//     ) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (
//         e: React.FormEvent<HTMLFormElement>
//     ) => {
//         e.preventDefault();
//         await login(formData);
//     };

//     return (
//         <div className={styles.container}>
//             <form className={styles.form} onSubmit={handleSubmit}>
//                 <h1>CRM Login</h1>

//                 {error && (
//                     <p className={styles.error}>
//                         {error}
//                     </p>
//                 )}

//                 <div className={styles.formGroup}>
//                     <label htmlFor="username">Tên đăng nhập</label>
//                     <input
//                         id="username"
//                         type="text"
//                         name="username"
//                         value={formData.username}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>

//                 <div className={styles.formGroup}>
//                     <label htmlFor="password">Mật khẩu</label>
//                     <input
//                         id="password"
//                         type="password"
//                         name="password"
//                         value={formData.password}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>

//                 <button type="submit" disabled={loading}>
//                     {loading ? "Đang đăng nhập..." : "Đăng nhập"}
//                 </button>
//             </form>
//         </div>
//     );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import { useLogin } from "./hooks/useLogin";
import styles from "./styles/login.module.css";

export default function LoginPage() {
    const { login, loading, error } = useLogin();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    // refs
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const loginButtonRef = useRef<HTMLButtonElement>(null);

    // focus username khi mở trang
    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        await login(formData);
    };

    // xử lý phím
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: "username" | "password"
    ) => {
        // ENTER
        if (e.key === "Enter") {
            e.preventDefault();

            if (field === "username") {
                passwordRef.current?.focus();
            } else if (field === "password") {
                loginButtonRef.current?.click();
            }
        }

        // ARROW DOWN
        if (e.key === "ArrowDown") {
            e.preventDefault();

            if (field === "username") {
                passwordRef.current?.focus();
            } else if (field === "password") {
                loginButtonRef.current?.focus();
            }
        }

        // ARROW UP
        if (e.key === "ArrowUp") {
            e.preventDefault();

            if (field === "password") {
                usernameRef.current?.focus();
            }
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1>CRM Login</h1>

                {error && (
                    <p className={styles.error}>
                        {error}
                    </p>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="username">
                        Tên đăng nhập
                    </label>

                    <input
                        ref={usernameRef}
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onKeyDown={(e) =>
                            handleKeyDown(e, "username")
                        }
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">
                        Mật khẩu
                    </label>

                    <input
                        ref={passwordRef}
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onKeyDown={(e) =>
                            handleKeyDown(e, "password")
                        }
                        required
                    />
                </div>

                <button
                    ref={loginButtonRef}
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Đang đăng nhập..."
                        : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}