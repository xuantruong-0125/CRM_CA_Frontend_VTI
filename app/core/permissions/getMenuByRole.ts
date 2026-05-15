import { MENU_CONFIG } from "./menu.config";

export const getMenuByRole = (role: string) => {
  return MENU_CONFIG.filter((m) => m.roles.includes(role));
};