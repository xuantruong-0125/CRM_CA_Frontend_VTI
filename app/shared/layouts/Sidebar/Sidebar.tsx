"use client";

import React, { useState } from "react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { getMenuByRole } from "@/core/permissions/getMenuByRole";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = getCurrentUser();
  const menus = getMenuByRole(user.role);

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        {!isCollapsed && <h3 className={styles.logo}>CRM_VTI</h3>}
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.menu}>
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <Link 
              key={item.key} 
              href={item.path} 
              className={styles.menuItem}
              title={isCollapsed ? item.label : ""}
            >
              <div className={styles.iconWrapper}>
                <Icon size={18} />
              </div>
              {!isCollapsed && <span className={styles.label}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}