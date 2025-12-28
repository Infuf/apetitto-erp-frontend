import {useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../../../api/axiosInstance';
import type {DashboardStockItemDto, IncomingStockReportDto} from '../types';

interface IncomingReportParams {
    dateFrom: string;
    dateTo: string;
    destinationWarehouseIds?: number[];
}

const fetchStockValuation = async (warehouseIds: number[]): Promise<DashboardStockItemDto[]> => {
    const params = new URLSearchParams();
    if (warehouseIds && warehouseIds.length > 0) {
        warehouseIds.forEach(id => params.append('warehouseIds', id.toString()));
    }

    const {data} = await axiosInstance.get('/warehouse/dashboard/stock-valuation-details', {params});
    return data;
};

const fetchIncomingReport = async ({
                                       dateFrom,
                                       dateTo,
                                       destinationWarehouseIds
                                   }: IncomingReportParams): Promise<IncomingStockReportDto[]> => {
    const params = new URLSearchParams();
    params.append('dateFrom', dateFrom);
    params.append('dateTo', dateTo);

    if (destinationWarehouseIds && destinationWarehouseIds.length > 0) {
        destinationWarehouseIds.forEach(id => params.append('destinationWarehouseIds', id.toString()));
    }

    const {data} = await axiosInstance.get('/warehouse/dashboard/incoming-report', {params});
    return data;
};

export const useWarehouseAnalytics = () => {

    const useStockValuation = (warehouseIds: number[]) => useQuery({
        queryKey: ['stockValuation', warehouseIds],
        queryFn: () => fetchStockValuation(warehouseIds),
        enabled: warehouseIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });

    const useIncomingReport = (dateFrom: string, dateTo: string, warehouseIds?: number[]) => useQuery({
        queryKey: ['incomingReport', dateFrom, dateTo, warehouseIds],
        queryFn: () => fetchIncomingReport({dateFrom, dateTo, destinationWarehouseIds: warehouseIds}),
        enabled: !!dateFrom && !!dateTo,
    });

    return {
        useStockValuation,
        useIncomingReport
    };
};