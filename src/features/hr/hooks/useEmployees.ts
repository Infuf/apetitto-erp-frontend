import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import type {
    Employee,
    EmployeeCreateDto,
    EmployeeUpdateDto,
    PageEmployeeDto
} from '../types';


const fetchEmployees = async (page: number, size: number): Promise<PageEmployeeDto> => {
    const { data } = await axiosInstance.get('/hr/employees', {
        params: { page, size, sort: 'id,desc' }
    });
    return data;
};

const createEmployee = async (dto: EmployeeCreateDto): Promise<Employee> => {
    const { data } = await axiosInstance.post('/hr/employees', dto);
    return data;
};

const updateEmployee = async ({ id, dto }: { id: number; dto: EmployeeUpdateDto }): Promise<Employee> => {
    const { data } = await axiosInstance.put(`/hr/employees/${id}`, dto);
    return data;
};

const dismissEmployee = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/hr/employees/${id}`);
};

export const useEmployees = () => {
    const queryClient = useQueryClient();

    const usePaginatedEmployees = (page: number, pageSize: number) => useQuery({
        queryKey: ['employees', page, pageSize],
        queryFn: () => fetchEmployees(page, pageSize),
        placeholderData: keepPreviousData,
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    };

    const createMutation = useMutation({ mutationFn: createEmployee, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: updateEmployee, ...mutationOptions });
    const dismissMutation = useMutation({ mutationFn: dismissEmployee, ...mutationOptions });

    return {
        usePaginatedEmployees,
        createEmployee: createMutation,
        updateEmployee: updateMutation,
        dismissEmployee: dismissMutation,
    };
};