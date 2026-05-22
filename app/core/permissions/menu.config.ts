import { Building2, ShieldCheck, Menu, Users, Layers, Package, Banknote, Contact2, UserCog } from "lucide-react";

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
        roles: ["IT"],
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
        icon: Contact2,
        roles: ["ADMIN", "IT"],
    },
    {
        key: "customer",
        label: "Khách hàng",
        path: "/customers",
        icon: Users,
        roles: ["ADMIN", "IT"],
    },
];