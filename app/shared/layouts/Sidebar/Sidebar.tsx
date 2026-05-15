"use client";

import styles from "./Sidebar.module.css";
import Link from "next/link";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { getMenuByRole } from "@/core/permissions/getMenuByRole";
import { Users, Target } from "lucide-react";

export default function Sidebar() {
  const user = getCurrentUser();
  const menus = getMenuByRole(user.role);

  const moduleLinks = [
    { key: "leads", label: "Leads", path: "/leads", icon: Target },
    { key: "customers", label: "Customers", path: "/customers", icon: Users },
  ];

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.logo}>CRM_VTI</h3>

      <nav className={styles.menu}>
        {menus.map((item) => {
          const Icon = item.icon; // 👈 lấy component icon

          return (
            <Link key={item.key} href={item.path} className={styles.menuItem}>
              <Icon size={18} />   {/* 👈 render icon */}
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className={styles.divider} />
        {moduleLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.path} className={styles.menuItem}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}