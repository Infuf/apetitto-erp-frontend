import {useMemo, useState} from 'react';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {addMonths, endOfMonth, format, startOfMonth, subMonths} from 'date-fns';
import {axiosInstance} from '../../../api/axiosInstance';
import type {EmployeeExtendedDetailDto} from '../types';

export type PeriodType = 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_MONTH' | 'CUSTOM';

const fetchEmployeeDetails = async (employeeId: number, dateFrom: string, dateTo: string): Promise<EmployeeExtendedDetailDto> => {
    const {data} = await axiosInstance.get(`/hr/dashboard/employee/${employeeId}/details`, {
        params: {dateFrom, dateTo}
    });
    return data;
};

export const useEmployeeProfile = (employeeId?: number) => {
    const [periodType, setPeriodType] = useState<PeriodType>(() => {
        const today = new Date();
        return today.getDate() <= 15 ? 'FIRST_HALF' : 'SECOND_HALF';
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [customFrom, setCustomFrom] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [customTo, setCustomTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    const {dateFrom, dateTo} = useMemo(() => {
        if (periodType === 'CUSTOM') {
            return {dateFrom: customFrom, dateTo: customTo};
        }

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        let start: Date;
        let end: Date;

        switch (periodType) {
            case 'FIRST_HALF':
                start = new Date(year, month, 1);
                end = new Date(year, month, 15);
                break;
            case 'SECOND_HALF':
                start = new Date(year, month, 16);
                end = endOfMonth(currentMonth);
                break;
            case 'FULL_MONTH':
            default:
                start = startOfMonth(currentMonth);
                end = endOfMonth(currentMonth);
                break;
        }

        return {
            dateFrom: format(start, 'yyyy-MM-dd'),
            dateTo: format(end, 'yyyy-MM-dd')
        };
    }, [currentMonth, periodType, customFrom, customTo]);

    const {data, isLoading, isError, error, isFetching} = useQuery({
        queryKey: ['employeeProfile', employeeId, dateFrom, dateTo],
        queryFn: () => fetchEmployeeDetails(employeeId!, dateFrom, dateTo),
        enabled: !!employeeId,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });

    const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

    return {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        periodType,
        setPeriodType,
        currentMonth,
        nextMonth,
        prevMonth,
        customFrom, setCustomFrom,
        customTo, setCustomTo,
        activeDateRange: {dateFrom, dateTo}
    };
};