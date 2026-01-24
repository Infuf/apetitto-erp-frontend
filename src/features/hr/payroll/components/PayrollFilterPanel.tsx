import {useMemo, useState} from 'react';
import {Autocomplete, Box, Button, CircularProgress, Grid, Paper, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {useDepartments} from '../../hooks/useDepartments';
import {useEmployees} from '../../hooks/useEmployees';
import type {PayrollFilters} from '../types';
import type {Department, Employee} from '../../types';

interface PayrollFilterPanelProps {
    onApply: (filters: PayrollFilters) => void;
    isLoading?: boolean;
}

export const PayrollFilterPanel = ({onApply, isLoading}: PayrollFilterPanelProps) => {
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const {departments, isLoading: deptLoading} = useDepartments();
    const {usePaginatedEmployees} = useEmployees();

    const {data: employeesPage, isLoading: empLoading} = usePaginatedEmployees(0, 1000);

    const activeEmployees = useMemo(() => {
        if (!employeesPage?.content) return [];
        return employeesPage.content.filter(emp => emp.isActive);
    }, [employeesPage]);


    const handleApply = () => {
        onApply({
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            departmentId: selectedDepartment?.id || null,
            employeeId: selectedEmployee?.id || null,
        });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedDepartment(null);
        setSelectedEmployee(null);
        onApply({
            dateFrom: null,
            dateTo: null,
            departmentId: null,
            employeeId: null,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleApply();
    };

    return (
        <Paper sx={{p: 2, mb: 3}} elevation={1}>
            <Grid container spacing={2} alignItems="center" onKeyDown={handleKeyDown}>

                {/* 1. Выбор Дат */}
                <Grid size={{xs: 12, md: 3}}>
                    <Box sx={{display: 'flex', gap: 1}}>
                        <TextField
                            label="С"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                        <TextField
                            label="По"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </Box>
                </Grid>

                {/* 2. Выбор Департамента */}
                <Grid size={{xs: 12, md: 3}}>

                    <Autocomplete
                        options={departments}
                        getOptionLabel={(option) => option.name}
                        value={selectedDepartment}
                        onChange={(_, newValue) => setSelectedDepartment(newValue)}
                        loading={deptLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Отдел"
                                size="small"
                                placeholder="Все отделы"
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>

                {/* 3. Выбор Сотрудника */}
                <Grid size={{xs: 12, md: 4}}>

                    <Autocomplete
                        options={activeEmployees}
                        getOptionLabel={(option) => option.fullName}
                        value={selectedEmployee}
                        onChange={(_, newValue) => setSelectedEmployee(newValue)}
                        loading={empLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Сотрудник"
                                size="small"
                                placeholder="Поиск по фамилии..."
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>

                {/* 4. Кнопки Действий */}
                <Grid size={{xs: 12, md: 2}}>

                    <Box sx={{display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleReset}
                            disabled={isLoading}
                            title="Сбросить фильтры"
                        >
                            <ClearIcon/>
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SearchIcon/>}
                            onClick={handleApply}
                            disabled={isLoading}
                            fullWidth
                        >
                            Найти
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};