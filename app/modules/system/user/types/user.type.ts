export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE";

export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    roleId: number;
    organizationId: number;
    status: UserStatus;
    createdAt: string;
    lastLogin: string | null;
}

export interface UserPayload {
    username: string;
    password?: string;
    email: string;
    fullName: string;
    roleId: number;
    organizationId: number;
    status: UserStatus;
}


// user.type.ts
export interface UserPageResponse {
    content: User[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface UserFilter {
    roleId?: number;
    organizationId?: number;
    page?: number;
    size?: number;
}