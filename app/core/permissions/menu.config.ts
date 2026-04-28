import { Building2, ShieldCheck, Menu, Users, Layers, Package, Banknote } from "lucide-react";

export const MENU_CONFIG = [
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
        roles: ["ADMIN"],
    },
    {
        key: "category",
        label: "Quản lý danh mục",
        path: "/categories",
        icon: Layers,
        roles: ["ADMIN", "IT"],
    },
    {
        key: "product",
        label: "Quản lý sản phẩm",
        path: "/products",
        icon: Package,
        roles: ["ADMIN", "IT"],
    },
    {
        key: "price",
        label: "Quản lý giá",
        path: "/prices",
        icon: Banknote,
        roles: ["ADMIN", "IT"],
    },
];