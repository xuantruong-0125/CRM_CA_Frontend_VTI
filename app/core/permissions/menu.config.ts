import { Building2, ShieldCheck, Menu, Users, Package, Layers, Banknote, Phone } from "lucide-react";

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
        roles: ["ADMIN", "IT", "PRODUCT_ADMIN"],
    },
    {
        key: "product",
        label: "Sản phẩm",
        path: "/products",
        icon: Package,
        roles: ["ADMIN", "IT", "PRODUCT_ADMIN"],
    },
    {
        key: "price",
        label: "Bảng giá",
        path: "/prices",
        icon: Banknote,
        roles: ["ADMIN", "IT", "PRODUCT_ADMIN"],
    },
    
    {
        key: "contact",
        label: "Liên hệ",
        path: "/contacts",
        icon: Phone,
        roles: ["ADMIN", "IT", "PRODUCT_ADMIN"],
    }
];