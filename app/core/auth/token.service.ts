const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USERNAME_KEY = "username";
const ROLES_KEY = "roles";

export const tokenService = {
    save(data: {
        accessToken: string;
        refreshToken: string;
        username: string;
        roles: string[];
    }) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        localStorage.setItem(USERNAME_KEY, data.username);
        localStorage.setItem(ROLES_KEY, JSON.stringify(data.roles));
    },

    clear() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem(ROLES_KEY);
    },

    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    getUsername() {
        return localStorage.getItem(USERNAME_KEY);
    },

    getRoles(): string[] {
        const roles = localStorage.getItem(ROLES_KEY);
        return roles ? JSON.parse(roles) : [];
    },

    isAuthenticated() {
        return !!this.getAccessToken();
    },
};