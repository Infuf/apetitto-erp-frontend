export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    warehouseId?: number;
    warehouseName?: string;
    roles: string[];
}

export interface PageUserDto {
    content: User[];
    totalElements: number;
}

export interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;
    warehouseId: number | null;
    roles: string[];
}

export interface PasswordResetFormData {
    newPassword: string;
}

export interface RoleOption {
    value: string;
    label: string;
}

export interface WarehouseOption {
    id: number;
    name: string;
}