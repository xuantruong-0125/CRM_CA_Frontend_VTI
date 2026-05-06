export interface CurrentUser {
    username: string;
    fullName:string;
    roles: string[];
}

export const getCurrentUser = (): CurrentUser | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const username = localStorage.getItem("username");
    const roles = localStorage.getItem("roles");
    const fullname = localStorage.getItem("fullName");


    if (!username || !roles ) {
        return null;
    }

    return {
        username,
        fullName: fullname as string,
        roles: JSON.parse(roles),
    };
};