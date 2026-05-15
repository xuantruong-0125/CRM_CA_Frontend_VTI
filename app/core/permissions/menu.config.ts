import { Building2, ShieldCheck, Menu, Users, FileText, TrendingUp, GitBranch, Layers, AlertOctagon } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
    key: string;
    label: string;
    path: string;
    icon: LucideIcon;
    roles: string[];
    group?: string;
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
        path: "/crm/quotes",
        icon: FileText,
        roles: ["ADMIN", "SALES"],
        group: "CRM",
    },
    {
        key: "opportunities",
        label: "Cơ hội bán hàng",
        path: "/crm/opportunities",
        icon: TrendingUp,
        roles: ["ADMIN", "SALES"],
        group: "CRM",
    },
    {
        key: "pipelines",
        label: "Quy trình bán hàng",
        path: "/crm/pipelines",
        icon: GitBranch,
        roles: ["ADMIN"],
        group: "CRM",
    },
    {
        key: "pipelineStages",
        label: "Giai đoạn quy trình",
        path: "/crm/pipeline-stages",
        icon: Layers,
        roles: ["ADMIN"],
        group: "CRM",
    },
    {
        key: "lossReasons",
        label: "Lý do thất bại",
        path: "/crm/loss-reasons",
        icon: AlertOctagon,
        roles: ["ADMIN"],
        group: "CRM",
    },
];