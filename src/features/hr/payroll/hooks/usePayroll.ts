
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { axiosInstance } from '../../../../api/axiosInstance';
import type {
    PagePayrollAccrualDto,
    PayrollAccrual,
    PayrollRequestDto,
    PayrollFilters
} from '../types';


const fetchPayrolls = async (page: number, size: number, filters: PayrollFilters): Promise<PagePayrollAccrualDto> => {
    const { data } = await axiosInstance.get('/hr/payroll', {
        params: {
            page,
            size,
            sort: 'id,desc',
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            departmentId: filters.departmentId,
            employeeId: filters.employeeId
        }
    });
    return data;
};

const fetchPayrollById = async (id: number): Promise<PayrollAccrual> => {
    const { data } = await axiosInstance.get(`/hr/payroll/${id}`);
    return data;
};

const calculatePayroll = async (req: PayrollRequestDto): Promise<void> => {
    await axiosInstance.post('/hr/payroll/calculate', req);
};

const cancelPayroll = async (id: number): Promise<void> => {
    await axiosInstance.post(`/hr/payroll/${id}/cancel`);
};


export const usePayroll = () => {
    const queryClient = useQueryClient();

    const usePaginatedPayrolls = (page: number, pageSize: number, filters: PayrollFilters) => useQuery({
        queryKey: ['payrolls', page, pageSize, filters],
        queryFn: () => fetchPayrolls(page, pageSize, filters),
        placeholderData: keepPreviousData,
    });

    const usePayrollDetails = (id: number | null) => useQuery({
        queryKey: ['payroll', id],
        queryFn: () => fetchPayrollById(id!),
        enabled: !!id,
    });

    const calculateMutation = useMutation({
        mutationFn: calculatePayroll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['financeTransactions'] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: cancelPayroll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['financeTransactions'] });
        },
    });

    return {
        usePaginatedPayrolls,
        usePayrollDetails,
        calculate: calculateMutation,
        cancel: cancelMutation,
    };
};