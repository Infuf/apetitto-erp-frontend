import {keepPreviousData, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosInstance} from '../../../api/axiosInstance';
import type {AttendanceGridResponseDto, AttendanceUpdateDto, SingleAttendanceRecordDto} from '../types.ts';

interface GridParams {
    departmentId?: number | null;
    dateFrom: string;
    dateTo: string;
}

const fetchAttendanceGrid = async ({
                                       departmentId,
                                       dateFrom,
                                       dateTo
                                   }: GridParams): Promise<AttendanceGridResponseDto> => {

    const params = {
        dateFrom,
        dateTo,
        ...(departmentId ? {departmentId} : {})
    };

    const {data} = await axiosInstance.get('/hr/dashboard/grid', {params});
    return data;
};

const fetchSingleRecord = async (employeeId: number, date: string): Promise<SingleAttendanceRecordDto> => {
    const {data} = await axiosInstance.get('/hr/dashboard/attendance-record', {
        params: {employeeId, date}
    });
    return data;
};

const updateAttendance = async (dto: AttendanceUpdateDto): Promise<void> => {
    await axiosInstance.post('/hr/attendance', dto);
};

export const useAttendance = () => {
    const queryClient = useQueryClient();

    const useGrid = (dateFrom: string, dateTo: string, departmentId?: number | null, enabled: boolean = true) => useQuery({
        queryKey: ['attendanceGrid', dateFrom, dateTo, departmentId],
        queryFn: () => fetchAttendanceGrid({dateFrom, dateTo, departmentId}),
        placeholderData: keepPreviousData,
        enabled: enabled,
    });

    const useRecord = (employeeId: number | null, date: string | null) => useQuery({
        queryKey: ['attendanceRecord', employeeId, date],
        queryFn: () => fetchSingleRecord(employeeId!, date!),
        enabled: !!employeeId && !!date,
        staleTime: 0,
    });

    const updateMutation = useMutation({
        mutationFn: updateAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['attendanceGrid']});
            queryClient.invalidateQueries({queryKey: ['attendanceRecord']});
        },
    });

    return {
        useGrid,
        useRecord,
        updateAttendance: updateMutation
    };
};