export interface CurrentUser {
    id: number;
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
    const userId = localStorage.getItem("userId");


    if (!username || !roles || !userId) {
        return null;
    }

    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
        return null;
    }

    return {
        id: parsedUserId,
        username,
        fullName: fullname as string,
        roles: JSON.parse(roles),
    };
};