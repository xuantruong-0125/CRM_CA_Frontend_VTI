"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import styles from "../styles/opportunity.module.css";

const TABS = [
    { label: "Cơ hội", path: "/opportunities" },
    { label: "Quy trình", path: "/pipelines", adminOnly: true },
    { label: "Giai đoạn", path: "/pipeline-stages", adminOnly: true },
    { label: "Lý do thua", path: "/loss-reasons", adminOnly: true },
];

export default function OpportunitySubNav() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        setIsAdmin(user?.roles?.includes("ADMIN") ?? false);
    }, []);

    const tabs = TABS.filter(t => !t.adminOnly || isAdmin);
    if (tabs.length <= 1) return null;

    return (
        <div className={styles.subNav}>
            {tabs.map(t => (
                <Link
                    key={t.path}
                    href={t.path}
                    className={`${styles.subNavTab} ${pathname === t.path ? styles.subNavTabActive : ""}`}
                >
                    {t.label}
                </Link>
            ))}
        </div>
    );
}
