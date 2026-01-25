import {useMemo, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import GroupIcon from '@mui/icons-material/Group';

import {endOfMonth, format, startOfMonth} from 'date-fns';
import {ru} from 'date-fns/locale';

import {useDepartments} from '../../hooks/useDepartments';
import {useEmployees} from '../../hooks/useEmployees';
import type {PayrollRequestDto} from '../types';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: PayrollRequestDto) => void;
    isSubmitting: boolean;
}

type PeriodType = 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_MONTH' | 'CUSTOM';
type TargetType = 'ALL' | 'DEPARTMENT' | 'EMPLOYEE';

export const PayrollCalculationDialog = ({open, onClose, onSubmit, isSubmitting}: Props) => {
    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [periodType, setPeriodType] = useState<PeriodType>('FIRST_HALF');

    const [customStart, setCustomStart] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [targetType, setTargetType] = useState<TargetType>('ALL');
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
    const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

    const {departments} = useDepartments();

    const {usePaginatedEmployees} = useEmployees();
    const {data: employeesPage, isLoading: empLoading} = usePaginatedEmployees(0, 1000);

    const activeEmployees = useMemo(() => {
        if (!employeesPage?.content) return [];
        return employeesPage.content.filter(emp => emp.isActive);
    }, [employeesPage]);

    const {startDate, endDate, dateLabel} = useMemo(() => {
        if (periodType === 'CUSTOM') {
            return {
                startDate: customStart,
                endDate: customEnd,
                dateLabel: 'Произвольный период'
            };
        }

        const date = new Date(currentMonth + '-01');
        const year = date.getFullYear();
        const month = date.getMonth();

        let start: string;
        let end: string;
        let label: string;

        switch (periodType) {
            case 'FIRST_HALF':
                start = format(new Date(year, month, 1), 'yyyy-MM-dd');
                end = format(new Date(year, month, 15), 'yyyy-MM-dd');
                label = 'Аванс (1-я половина)';
                break;
            case 'SECOND_HALF':
                start = format(new Date(year, month, 16), 'yyyy-MM-dd');
                end = format(endOfMonth(date), 'yyyy-MM-dd');
                label = 'Зарплата (2-я половина)';
                break;
            case 'FULL_MONTH':
            default:
                start = format(startOfMonth(date), 'yyyy-MM-dd');
                end = format(endOfMonth(date), 'yyyy-MM-dd');
                label = 'Полный месяц';
                break;
        }

        return {startDate: start, endDate: end, dateLabel: label};
    }, [currentMonth, periodType, customStart, customEnd]);

    const handleSubmit = () => {
        onSubmit({
            periodStart: startDate,
            periodEnd: endDate,
            departmentId: targetType === 'DEPARTMENT' ? selectedDeptId : undefined,
            employeeId: targetType === 'EMPLOYEE' ? selectedEmpId : undefined,
        });
    };

    const isValid = () => {
        if (targetType === 'DEPARTMENT' && !selectedDeptId) return false;
        if (targetType === 'EMPLOYEE' && !selectedEmpId) return false;
        return true;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f5f5f5',
                borderBottom: '1px solid #eee'
            }}>
                <CalculateIcon color="primary"/>
                <Typography variant="h6">Расчет и начисление ЗП</Typography>
            </DialogTitle>

            <DialogContent sx={{pt: 3}}>

                {/* 1. Блок выбора периода */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom
                            sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <DateRangeIcon fontSize="small"/> 1. Выберите период
                </Typography>

                <ToggleButtonGroup
                    value={periodType}
                    exclusive
                    onChange={(_, v) => v && setPeriodType(v)}
                    fullWidth
                    size="small"
                    color="primary"
                    sx={{mb: 2}}
                >
                    <ToggleButton value="FIRST_HALF">Аванс (1-15)</ToggleButton>
                    <ToggleButton value="SECOND_HALF">Зарплата (16+)</ToggleButton>
                    <ToggleButton value="FULL_MONTH">Месяц</ToggleButton>
                    <ToggleButton value="CUSTOM">Вручную</ToggleButton>
                </ToggleButtonGroup>

                {periodType !== 'CUSTOM' ? (
                    <TextField
                        type="month"
                        fullWidth
                        size="small"
                        label="Месяц расчета"
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(e.target.value)}
                        InputLabelProps={{shrink: true}}
                    />
                ) : (
                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            label="С" type="date" fullWidth size="small"
                            value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                            InputLabelProps={{shrink: true}}
                        />
                        <TextField
                            label="По" type="date" fullWidth size="small"
                            value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                            InputLabelProps={{shrink: true}}
                        />
                    </Box>
                )}

                <Paper
                    variant="outlined"
                    sx={{
                        mt: 2, p: 2,
                        bgcolor: '#e3f2fd',
                        borderColor: '#90caf9',
                        textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                >
                    <Typography variant="caption" color="text.secondary"
                                sx={{textTransform: 'uppercase', letterSpacing: 1}}>
                        Будет начислено за период
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {format(new Date(startDate), 'd MMMM yyyy', {locale: ru})} — {format(new Date(endDate), 'd MMMM yyyy', {locale: ru})}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ({dateLabel})
                    </Typography>
                </Paper>

                <Divider sx={{my: 3}}/>

                {/* 2. Блок выбора цели */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom
                            sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <GroupIcon fontSize="small"/> 2. Кому начислить?
                </Typography>

                <RadioGroup
                    row
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as TargetType)}
                    sx={{mb: 2, justifyContent: 'space-between'}}
                >
                    <FormControlLabel value="ALL" control={<Radio/>} label={
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}><CalendarMonthIcon fontSize="small"
                                                                                                       color="action"/> Всем</Box>
                    }/>
                    <FormControlLabel value="DEPARTMENT" control={<Radio/>} label={
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}><DomainIcon fontSize="small"
                                                                                                color="action"/> Отделу</Box>
                    }/>
                    <FormControlLabel value="EMPLOYEE" control={<Radio/>} label={
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}><PersonIcon fontSize="small"
                                                                                                color="action"/> Сотруднику</Box>
                    }/>
                </RadioGroup>

                {targetType === 'DEPARTMENT' && (
                    <Autocomplete
                        options={departments}
                        getOptionLabel={(opt) => opt.name}
                        value={departments.find(d => d.id === selectedDeptId) || null}
                        onChange={(_, v) => setSelectedDeptId(v?.id || null)}
                        renderInput={(params) => <TextField {...params} label="Выберите департамент" size="small"/>}
                    />
                )}

                {targetType === 'EMPLOYEE' && (
                    <Autocomplete
                        options={activeEmployees}
                        getOptionLabel={(opt) => `${opt.fullName} (${opt.positionTitle})`}
                        value={activeEmployees.find(e => e.id === selectedEmpId) || null}
                        onChange={(_, v) => setSelectedEmpId(v?.id || null)}
                        loading={empLoading}
                        renderInput={(params) => <TextField {...params} label="Выберите активного сотрудника"
                                                            size="small"/>}
                        noOptionsText="Нет активных сотрудников"
                    />
                )}

            </DialogContent>
            <DialogActions sx={{p: 2, borderTop: '1px solid #eee'}}>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValid() || isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : <CalculateIcon/>}
                >
                    {isSubmitting ? 'Расчет...' : 'Рассчитать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};