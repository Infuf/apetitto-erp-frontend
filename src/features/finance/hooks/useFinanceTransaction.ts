import {keepPreviousData, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosInstance} from '../../../api/axiosInstance';
import type {
    CancellationRequestDto,
    FinanceFilters,
    PageTransactionResponseDto,
    TransactionCreateRequestDto,
    TransactionResponseDto
} from '../types';

const fetchTransactions = async (
    page: number,
    size: number,
    filters: FinanceFilters
): Promise<PageTransactionResponseDto> => {
    const {data} = await axiosInstance.get('/finance/transactions', {
        params: {
            page,
            size,
            sort: 'transactionDate,desc',
            accountId: filters.accountId,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        }
    });
    return data;
};

const createTransaction = async (data: TransactionCreateRequestDto): Promise<TransactionResponseDto> => {
    const {data: result} = await axiosInstance.post('/finance/transactions', data);
    return result;
};

const cancelTransaction = async ({id, data}: { id: number; data: CancellationRequestDto }): Promise<void> => {
    await axiosInstance.post(`/finance/transactions/${id}/cancel`, data);
};
const fetchTransactionDetails = async (id: number): Promise<TransactionResponseDto> => {
    const {data} = await axiosInstance.get(`/finance/transactions/${id}`);
    return data;
};

const useTransactionDetails = (id: number | null) => useQuery({
    queryKey: ['financeTransaction', id],
    queryFn: () => fetchTransactionDetails(id!),
    enabled: !!id,
});

export const useFinanceTransactions = () => {
    const queryClient = useQueryClient();

    const cancelMutation = useMutation({
        mutationFn: cancelTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['financeTransactions']});
            queryClient.invalidateQueries({queryKey: ['financeAccounts']});
            queryClient.invalidateQueries({queryKey: ['financeTransaction']});
        },
    });
    const usePaginatedTransactions = (page: number, pageSize: number, filters: FinanceFilters) =>
        useQuery({
            queryKey: ['financeTransactions', page, pageSize, filters],
            queryFn: () => fetchTransactions(page, pageSize, filters),
            placeholderData: keepPreviousData,
        });

    const createMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['financeTransactions']});
            queryClient.invalidateQueries({queryKey: ['financeAccounts']});
        },
    });

    return {
        usePaginatedTransactions,
        createTransaction: createMutation,
        cancelTransaction: cancelMutation,
        useTransactionDetails
    };
};