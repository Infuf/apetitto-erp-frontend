import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import type { Department, DepartmentFormData } from '../types.ts';

const fetchDepartments = async (): Promise<Department[]> => {
    const { data } = await axiosInstance.get('/hr/departments');
    return data;
};

const createDepartment = async (dto: DepartmentFormData): Promise<Department> => {
    const { data } = await axiosInstance.post('/hr/departments', dto);
    return data;
};

const updateDepartment = async ({ id, dto }: { id: number; dto: DepartmentFormData }): Promise<Department> => {
    const { data } = await axiosInstance.put(`/hr/departments/${id}`, dto);
    return data;
};

const deleteDepartment = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/hr/departments/${id}`);
};

export const useDepartments = () => {
    const queryClient = useQueryClient();

    const { data: departments = [], isLoading, isError, error } = useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    };

    const createMutation = useMutation({ mutationFn: createDepartment, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: updateDepartment, ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteDepartment, ...mutationOptions });

    return {
        departments,
        isLoading,
        isError,
        error,
        createDepartment: createMutation,
        updateDepartment: updateMutation,
        deleteDepartment: deleteMutation,
    };
};