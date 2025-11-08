
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface CanProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export const Can = ({ allowedRoles, children }: CanProps) => {
    const { user } = useAuth();

    const userRoles = user?.roles;
    if (!userRoles || userRoles.length === 0) {
        return null;
    }

    const hasPermission = userRoles.some(role => allowedRoles.includes(role));

    return hasPermission ? <>{children}</> : null;
};