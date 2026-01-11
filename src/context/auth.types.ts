export interface User {
    id: number;
    username: string;
    roles: string[];
    employeeId: number | null;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export interface JwtPayload {
    sub: string;
    exp: number;
}
