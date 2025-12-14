import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import {jwtDecode} from 'jwt-decode';
import {axiosInstance} from '../api/axiosInstance.ts';

interface User {
    username: string;
    roles: string[];
}

interface JwtPayload {
    sub: string;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode<JwtPayload>(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    const currentUser: User = {
                        username: decodedToken.sub,
                        roles: JSON.parse(localStorage.getItem('userRoles') || '[]'),
                    };
                    setUser(currentUser);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRoles');
                }
            } catch (error) {
                console.error("Failed to decode token on startup:", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRoles');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (loggedInUser: User, token: string) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRoles', JSON.stringify(loggedInUser.roles));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(loggedInUser);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};