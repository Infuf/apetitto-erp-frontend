import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import type {
    CompanyFinancialStateDto,
    IncomeReportDto,
    ExpenseReportDto, PartnersAnalysisReportDto
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

interface PartnerAnalysisParams {
    dateFrom: string;
    dateTo: string;
    isSupplier: boolean;
}

const fetchPartnerAnalysis = async ({ dateFrom, dateTo, isSupplier }: PartnerAnalysisParams): Promise<PartnersAnalysisReportDto> => {
    const { data } = await axiosInstance.get('/finance/dashboard/partners/analysis', {
        params: { dateFrom, dateTo, isSupplier }
    });
    return data;
};


export const useFinanceAnalytics = () => {

    const usePartnerAnalysis = (dateFrom: string, dateTo: string, reportType: 'SUPPLIER' | 'DEALER' | null) => useQuery({
        queryKey: ['partnerAnalysis', dateFrom, dateTo, reportType],
        queryFn: () => fetchPartnerAnalysis({
            dateFrom,
            dateTo,
            isSupplier: reportType === 'SUPPLIER'
        }),
        enabled: !!dateFrom && !!dateTo && reportType !== null,
    });

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
        usePartnerAnalysis,
        useCompanyState,
        useIncomeReport,
        useExpenseReport
    };
};