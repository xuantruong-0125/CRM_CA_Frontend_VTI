import { MENU_CONFIG } from "./menu.config";

export const getMenuByRole = (role: string) => {
    if (!role)
        return [];
    return MENU_CONFIG.filter(menu =>
        menu.roles.includes(role)
    );
};