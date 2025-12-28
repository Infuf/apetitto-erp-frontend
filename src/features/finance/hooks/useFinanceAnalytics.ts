import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import type {
    CompanyFinancialStateDto,
    IncomeReportDto,
    ExpenseReportDto
} from '../types';

interface DateRangeParams {
    dateFrom: string;
    dateTo: string;
}


const fetchCompanyState = async (): Promise<CompanyFinancialStateDto> => {
    const { data } = await axiosInstance.get('/finance/dashboard/state');
    return data;
};

const fetchIncomeReport = async (params: DateRangeParams): Promise<IncomeReportDto> => {
    const { data } = await axiosInstance.get('/finance/dashboard/income', { params });
    return data;
};

const fetchExpenseReport = async (params: DateRangeParams): Promise<ExpenseReportDto> => {
    const { data } = await axiosInstance.get('/finance/dashboard/expenses', { params });
    return data;
};


export const useFinanceAnalytics = () => {

    const useCompanyState = () => useQuery({
        queryKey: ['financeDashboardState'],
        queryFn: fetchCompanyState,
        staleTime: 1000 * 60,
    });

    const useIncomeReport = (dateFrom: string | null, dateTo: string | null) => useQuery({
        queryKey: ['financeIncomeReport', dateFrom, dateTo],
        queryFn: () => fetchIncomeReport({ dateFrom: dateFrom!, dateTo: dateTo! }),
        enabled: !!dateFrom && !!dateTo,
    });

    const useExpenseReport = (dateFrom: string | null, dateTo: string | null) => useQuery({
        queryKey: ['financeExpenseReport', dateFrom, dateTo],
        queryFn: () => fetchExpenseReport({ dateFrom: dateFrom!, dateTo: dateTo! }),
        enabled: !!dateFrom && !!dateTo,
    });

    return {
        useCompanyState,
        useIncomeReport,
        useExpenseReport
    };
};