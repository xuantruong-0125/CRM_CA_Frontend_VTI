export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userId:number;
    username: string;
    fullName: string;
    roles: string[];
    scope: string;
}