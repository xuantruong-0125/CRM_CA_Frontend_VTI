import { Building2, ShieldCheck, Menu, Users, FileText, GitBranch, Layers, AlertOctagon, TrendingUp, Package, Banknote, Phone, Target, BarChart3, Trophy } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
    key: string;
    label: string;
    path: string;
    icon: LucideIcon;
    roles: string[];
    group?: string;
    children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
    {
        key: "organization",
        label: "Quản lý tổ chức",
        path: "/system/organizations",
        icon: Building2,
        roles: ["ADMIN"],
        group: "Hệ thống",
    },
    {
        key: "role",
        label: "Quản lý chức vụ",
        path: "/system/roles",
        icon: ShieldCheck,
        roles: ["ADMIN", "IT"],
        group: "Hệ thống",
    },
    {
        key: "menu",
        label: "Quản lý menu",
        path: "/system/menus",
        icon: Menu,
        roles: ["ADMIN"],
        group: "Hệ thống",
    },
    {
        key: "user",
        label: "Quản lý user",
        path: "/system/users",
        icon: Users,
        roles: ["IT"],
        group: "Hệ thống",
    },
    {
        key: "quotes",
        label: "Báo giá",
        path: "/quotes",
        icon: FileText,
        roles: ["ADMIN", "SALE", "SALE_MANAGER", "MANAGER", "ACCOUNTANT"],
        group: "CRM",
    },
    {
        key: "opportunities",
        label: "Cơ hội",
        path: "/opportunities",
        icon: TrendingUp,
        roles: ["ADMIN", "SALE", "SALE_MANAGER", "MANAGER"],
        group: "CRM",
        children: [
            { key: "pipelines", label: "Quy trình bán hàng", path: "/pipelines", icon: GitBranch, roles: ["ADMIN", "SALE"], group: "CRM" },
            { key: "pipelineStages", label: "Giai đoạn quy trình", path: "/pipeline-stages", icon: Layers, roles: ["ADMIN", "SALE"], group: "CRM" },
            { key: "lossReasons", label: "Lý do thất bại", path: "/loss-reasons", icon: AlertOctagon, roles: ["ADMIN", "SALE"], group: "CRM" },
        ],
    },
    {
        key: "category",
        label: "Danh mục",
        path: "/categories",
        icon: Layers,
        roles: ["ADMIN", "IT"],
    },
    {
        key: "product",
        label: "Sản phẩm",
        path: "/products",
        icon: Package,
        roles: ["ADMIN", "IT"],
    },
    {
        key: "price",
        label: "Bảng giá",
        path: "/prices",
        icon: Banknote,
        roles: ["ADMIN", "IT"],
    },
    
    {
        key: "contact",
        label: "Liên hệ",
        path: "/contacts",
        icon: Phone,
        roles: ["ADMIN", "IT"],
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