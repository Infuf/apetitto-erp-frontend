import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {axiosInstance} from '../../../../api/axiosInstance';
import type {PageUserDto, User, UserFormData, PasswordResetFormData} from '../types';

const fetchUsers = async (page: number, size: number): Promise<PageUserDto> => {
    const {data} = await axiosInstance.get('/users', {params: {page, size}});
    return data;
};

const updateUser = async ({id, userData}: { id: number, userData: UserFormData }): Promise<User> => {
    const {data} = await axiosInstance.put('/users', {id, ...userData});
    return data;
};

const deleteUser = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
};

const resetPassword = async ({id, passwordData}: {
    id: number,
    passwordData: PasswordResetFormData
}): Promise<void> => {
    await axiosInstance.post(`/users/${id}/reset-password`, passwordData);
};

export const useUsers = () => {
    const queryClient = useQueryClient();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']});
        },
    };

    const usePaginatedUsers = (page: number, pageSize: number) =>
        useQuery<PageUserDto, Error>({ // <-- Явно указываем <PageUserDto, Error>
            queryKey: ['users', page, pageSize],
            queryFn: () => fetchUsers(page, pageSize),
            placeholderData: (previousData) => previousData,
        });

    const updateMutation = useMutation({mutationFn: updateUser, ...mutationOptions});
    const deleteMutation = useMutation({mutationFn: deleteUser, ...mutationOptions});
    const resetPasswordMutation = useMutation({mutationFn: resetPassword, ...mutationOptions});

    return {
        usePaginatedUsers,
        update: updateMutation,
        delete: deleteMutation,
        resetPassword: resetPasswordMutation,
    };
};