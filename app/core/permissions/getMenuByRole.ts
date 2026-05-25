import { MENU_CONFIG, MenuItem } from "./menu.config";

export const getMenuByRole = (role: string): MenuItem[] => {
    return MENU_CONFIG.filter(menu =>
        menu.roles.includes(role)
    );
};