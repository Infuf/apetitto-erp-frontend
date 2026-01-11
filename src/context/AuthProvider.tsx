import type {ReactNode} from 'react';
import {useCallback, useEffect, useState} from 'react';
import {jwtDecode} from 'jwt-decode';
import {setUnauthorizedHandler} from '../api/axiosInstance';
import {AuthContext} from './AuthContext';
import type {JwtPayload, User} from './auth.types';

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user')
        setUser(null);
    }, []);

    const login = (userData: User, token: string) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const savedUserStr = localStorage.getItem('user');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.exp * 1000 < Date.now()) {
                logout();
                return;
            }

            if (savedUserStr) {
                const parsedUser = JSON.parse(savedUserStr) as User;
                setUser(parsedUser);
            } else {
                setUser({
                    id: 0,
                    username: decoded.sub,
                    roles: [],
                    employeeId: null
                });
            }
        } catch (e) {
            console.error("Auth init error:", e);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            logout();
        });
    }, [logout]);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            logout();
        });
    }, [logout]);

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
