"use client";

import { useState } from "react";
import { useLogin } from "./hooks/useLogin";
import styles from "./styles/login.module.css";

export default function LoginPage() {
    const { login, loading, error } = useLogin();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

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
        const trimmedData = {
            username: formData.username.trim(),
            password: formData.password.trim(),
        };
        await login(trimmedData);
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
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Mật khẩu</label>
                    <div className={styles.passwordContainer}>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button" 
                            className={styles.toggleButton} 
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? "Ẩn" : "Hiện"}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}