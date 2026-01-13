import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Autocomplete, TextField, Paper } from '@mui/material';
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from 'date-fns';

import { useAttendance } from '../../hooks/useAttendance';
import { useDepartments } from '../../hooks/useDepartments';
import { useAuth } from '../../../../context/useAuth';
import { PeriodSelector } from '../../personnel/components/PeriodSelector';
import { AttendanceHeatmap } from './AttendanceHeatmap';
import { EditAttendanceDialog } from './EditAttendanceDialog';
import type { PeriodType } from '../../hooks/useEmployeeProfile';

export const AttendanceGridPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdminOrHr = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_HR'].includes(r));
    const isManager = !isAdminOrHr;

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [periodType, setPeriodType] = useState<PeriodType>(() => {
        const today = new Date();
        return today.getDate() <= 15 ? 'FIRST_HALF' : 'SECOND_HALF';
    });

    const [customFrom, setCustomFrom] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [customTo, setCustomTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [editingCell, setEditingCell] = useState<{ employeeId: number, date: string } | null>(null);

    const { dateFrom, dateTo } = useMemo(() => {
        if (periodType === 'CUSTOM') return { dateFrom: customFrom, dateTo: customTo };

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        let start: Date, end: Date;

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
        return { dateFrom: format(start, 'yyyy-MM-dd'), dateTo: format(end, 'yyyy-MM-dd') };
    }, [currentMonth, periodType, customFrom, customTo]);

    const { useGrid } = useAttendance();
    const { departments, isLoading: isLoadingDepts } = useDepartments();

    const shouldFetch = isManager || (isAdminOrHr && !!selectedDepartmentId);

    const { data: gridData, isLoading: isGridLoading, error } = useGrid(
        dateFrom,
        dateTo,
        selectedDepartmentId,
        shouldFetch
    );

    const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Ish vaqti tabeli {/* Табель учета времени */}
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <PeriodSelector
                    periodType={periodType} setPeriodType={setPeriodType}
                    currentMonth={currentMonth} nextMonth={nextMonth} prevMonth={prevMonth}
                    customFrom={customFrom} setCustomFrom={setCustomFrom}
                    customTo={customTo} setCustomTo={setCustomTo}
                />

                {isAdminOrHr && (
                    <Box sx={{ mt: 2 }}>
                        <Autocomplete
                            options={departments}
                            getOptionLabel={(opt) => opt.name}
                            value={departments.find(d => d.id === selectedDepartmentId) || null}
                            onChange={(_, val) => setSelectedDepartmentId(val?.id || null)}
                            loading={isLoadingDepts}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Bo'limni tanlang" // Выберите департамент
                                    placeholder="Qidiruv..."
                                    helperText="Ma'lumotlarni ko'rish uchun bo'limni tanlang"
                                />
                            )}
                        />
                    </Box>
                )}
            </Paper>

            <Box>
                {isGridLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error">Xatolik yuz berdi: {(error as Error).message}</Alert>
                ) : !gridData || gridData.rows.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                        {isAdminOrHr && !selectedDepartmentId
                            ? "Ma'lumotlarni ko'rsatish uchun bo'limni tanlang."
                            : "Tanlangan davr uchun ma'lumot yo'q."}
                    </Alert>
                ) : (
                    <AttendanceHeatmap
                        data={gridData}
                        onCellClick={(employeeId, date) => setEditingCell({ employeeId, date })}
                        onEmployeeClick={(employeeId) => navigate(`/hr/employees/${employeeId}`)}
                    />
                )}
            </Box>

            {editingCell && (
                <EditAttendanceDialog
                    employeeId={editingCell.employeeId}
                    date={editingCell.date}
                    onClose={() => setEditingCell(null)}
                />
            )}
        </Box>
    );
};