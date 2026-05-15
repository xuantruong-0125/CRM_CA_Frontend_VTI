import { 
    Building2, 
    ShieldCheck, 
    Menu, 
    Users, 
    LayoutDashboard, 
    Target, 
    BarChart3,
    Trophy
} from "lucide-react";

export const MENU_CONFIG = [
    {
        key: "dashboard",
        label: "Bảng điều khiển",
        path: "/",
        icon: LayoutDashboard,
        roles: ["ADMIN", "IT", "MANAGER", "SALE"],
    },
    {
        key: "organization",
        label: "Quản lý tổ chức",
        path: "/system/organizations",
        icon: Building2,
        roles: ["ADMIN"],
    },
    {
        key: "role",
        label: "Quản lý chức vụ",
        path: "/system/roles",
        icon: ShieldCheck,
        roles: ["ADMIN", "IT"],
    },
    {
        key: "menu",
        label: "Quản lý menu",
        path: "/system/menus",
        icon: Menu,
        roles: ["ADMIN"],
    },
    {
        key: "user",
        label: "Quản lý user",
        path: "/system/users",
        icon: Users,
        roles: ["IT"],
    },
    {
        key: "kpi-config",
        label: "Thiết lập KPI",
        path: "/kpi-configs",
        icon: Target,
        roles: ["ADMIN", "IT", "MANAGER"],
    },
    {
        key: "reports",
        label: "Báo cáo KPI",
        path: "/reports",
        icon: BarChart3,
        roles: ["ADMIN", "MANAGER"],
    },
    {
        key: "my-kpi",
        label: "KPI Của Tôi",
        path: "/my-kpi",
        icon: Trophy,
        roles: ["SALE", "MANAGER", "ADMIN"],
    },
];