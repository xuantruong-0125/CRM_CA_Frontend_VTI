"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { getMenuByRole } from "@/core/permissions/getMenuByRole";
import { LogOut } from "lucide-react";
import ConfirmLogoutModal from "@/shared/components/ConfirmLogOut/ConfirmLogoutModal";
export default function Sidebar({
    collapsed,
    onToggle,
}: {
    collapsed: boolean;
    onToggle: () => void;
}) {

    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
    const router = useRouter();
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    const [loadingLogout, setLoadingLogout] = useState(false);

    useEffect(() => {
        setMounted(true);

        // load lần đầu
        setUser(getCurrentUser());

        const handleStorage = () => {
            setUser(getCurrentUser()); // 🔥 cập nhật lại khi có thay đổi
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Tránh lỗi Hydration
    if (!mounted || !user) {
        return null;
    }

    if (!user) {
        return null;
    }

    const role = user.roles[0];
    const menus = getMenuByRole(role);

    const handleLogout = async () => {
        try {
            setLoadingLogout(true);

            // Xóa localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");
            localStorage.removeItem("roles");
            localStorage.removeItem("fullName");

            // 🔥 trigger update sidebar (nếu bạn đang dùng storage listener)
            window.dispatchEvent(new Event("storage"));

            // Redirect về login
            window.location.href = "/login";
        } finally {
            setLoadingLogout(false);
        }
    };

    return (
        <div
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""
                }`}
        >
            {/* HEADER */}
            <div className={styles.header}>
                <h3 className={styles.logo}>
                    {collapsed ? "CRM" : "CRM_VTI"}
                </h3>

                <button
                    onClick={onToggle}
                    className={styles.toggleBtn}
                >
                    {collapsed ? (
                        <ChevronRight size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </button>
            </div>


            {/* MENU */}

            <nav className={styles.menu}>
                {menus.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.key}
                            href={item.path}
                            className={`${styles.menuItem} ${isActive ? styles.active : ""
                                }`}
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* USER INFO */}
            <div className={styles.userBox}>
                {!collapsed && (
                    <span className={styles.userInfo}>
                        {user.roles.join(", ")} : {user.fullName}
                    </span>
                )}

                <button
                    className={styles.logoutBtn}
                    onClick={() => setOpenLogoutModal(true)}
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Đăng xuất</span>}
                </button>
            </div>


            <ConfirmLogoutModal
                open={openLogoutModal}
                onClose={() => setOpenLogoutModal(false)}
                onConfirm={handleLogout}
                loading={loadingLogout}
            />
        </div>

    );
}