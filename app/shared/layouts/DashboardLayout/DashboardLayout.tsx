// "use client";

// import Sidebar from "@/shared/layouts/Sidebar/Sidebar";
// import styles from "./DashboardLayout.module.css";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className={styles.container}>
//       <Sidebar />
//       <div className={styles.content}>{children}</div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";

import Sidebar from "@/shared/layouts/Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div
        className={`${styles.content} ${collapsed ? styles.collapsed : ""
          }`}
      >
        {children}
      </div>
    </div>
  );
}