"use client";

import Sidebar from "@/shared/layouts/Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}