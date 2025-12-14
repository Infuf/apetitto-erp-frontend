import {keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosInstance} from '../../../api/axiosInstance';
import type {
    FetchTransfersParams,
    PageTransferOrderDto,
    TransferFilters,
    TransferOrder,
    TransferOrderRequestDto
} from '../types';


const fetchTransfersPaginated = async (
    page: number,
    size: number,
    filters: TransferFilters
): Promise<PageTransferOrderDto> => {
    const {data} = await axiosInstance.get('/transfers', {
        params: {
            page,
            size,
            sort: 'createdAt,desc',
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo
        },
    });
    return data;
};

const fetchTransfersInfinite = async ({
                                          pageParam = 0,
                                          sort = 'createdAt,desc'
                                      }: FetchTransfersParams): Promise<PageTransferOrderDto> => {
    const {data} = await axiosInstance.get('/transfers', {
        params: {page: pageParam, size: 5, sort},
    });
    return data;
};

const fetchTransferDetails = async (id: string): Promise<TransferOrder> => {
    const {data} = await axiosInstance.get(`/transfers/${id}`);
    return data;
};

const createTransfer = async (transferData: TransferOrderRequestDto): Promise<TransferOrder> => {
    const {data} = await axiosInstance.post('/transfers', transferData);
    return data;
};

const shipTransfer = async (id: number | string): Promise<TransferOrder> => {
    const {data} = await axiosInstance.post(`/transfers/${id}/ship`);
    return data;
};

const receiveTransfer = async (id: number | string): Promise<TransferOrder> => {
    const {data} = await axiosInstance.post(`/transfers/${id}/receive`);
    return data;
};


export const useTransfers = () => {
    const queryClient = useQueryClient();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['transfers']});
            queryClient.invalidateQueries({queryKey: ['transfer']});
        },
    };

    const createMutation = useMutation({mutationFn: createTransfer, ...mutationOptions});
    const shipMutation = useMutation({mutationFn: shipTransfer, ...mutationOptions});
    const receiveMutation = useMutation({mutationFn: receiveTransfer, ...mutationOptions});

    return {
        useInfiniteTransfers: () => useInfiniteQuery({
            queryKey: ['transfers', 'infinite'],
            queryFn: fetchTransfersInfinite,
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages) => lastPage.last ? undefined : allPages.length,
        }),

        usePaginatedTransfers: (page: number, pageSize: number, filters: TransferFilters) => useQuery({
            queryKey: ['transfers', 'paginated', page, pageSize, filters],
            queryFn: () => fetchTransfersPaginated(page, pageSize, filters),
            placeholderData: keepPreviousData,
        }),

        useTransferDetails: (id: number | null | undefined) => useQuery({
            queryKey: ['transfer', id],
            queryFn: () => fetchTransferDetails(id!.toString()),
            enabled: typeof id === 'number',
        }),

        create: createMutation,
        ship: shipMutation,
        receive: receiveMutation,
    };
};