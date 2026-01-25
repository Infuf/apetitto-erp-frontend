import {useState} from 'react';
import {Box, Button, Chip, IconButton, Paper, Typography} from '@mui/material';
import {DataGrid, type GridColDef, type GridPaginationModel} from '@mui/x-data-grid';
import CalculateIcon from '@mui/icons-material/Calculate';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';

import {usePayroll} from './hooks/usePayroll';
import {PayrollCalculationDialog} from './components/PayrollCalculationDialog';
import {PayrollPayslipDialog} from './components/PayrollPayslipDialog';
import {PayrollFilterPanel} from './components/PayrollFilterPanel';
import {formatCurrency} from '../../../lib/formatCurrency';
import type {PayrollAccrual, PayrollFilters, PayrollRequestDto} from './types';

export const PayrollPage = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({page: 0, pageSize: 25});
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);

    const [filters, setFilters] = useState<PayrollFilters>({
        dateFrom: null,
        dateTo: null,
        departmentId: null,
        employeeId: null
    });

    const {usePaginatedPayrolls, calculate, cancel} = usePayroll();

    const {data, isLoading, isFetching} = usePaginatedPayrolls(
        paginationModel.page,
        paginationModel.pageSize,
        filters
    );

    const handleFilterApply = (newFilters: PayrollFilters) => {
        setPaginationModel(prev => ({...prev, page: 0}));
        setFilters(newFilters);
    };

    const handleCalculate = (dto: PayrollRequestDto) => {
        calculate.mutate(dto, {
            onSuccess: () => setIsCalcOpen(false)
        });
    };

    const handleCancel = (id: number) => {
        if (window.confirm('Вы уверены, что хотите отменить это начисление? Баланс сотрудника будет уменьшен.')) {
            cancel.mutate(id);
        }
    };

    const columns: GridColDef<PayrollAccrual>[] = [
        {field: 'id', headerName: 'ID', width: 70},
        {
            field: 'periodStart', headerName: 'Период', width: 180,
            renderCell: (p) => `${p.row.periodStart} — ${p.row.periodEnd}`
        },
        {field: 'employeeName', headerName: 'Сотрудник', flex: 1.5},
        {field: 'departmentName', headerName: 'Отдел', flex: 1},
        {
            field: 'finalAmount', headerName: 'Сумма', width: 140,
            renderCell: (p) => <span style={{fontWeight: 'bold', color: '#1976d2'}}>{formatCurrency(p.value)}</span>
        },
        {
            field: 'status', headerName: 'Статус', width: 120,
            renderCell: (p) => (
                <Chip
                    label={p.value === 'APPROVED' ? 'Начислено' : 'Отменено'}
                    color={p.value === 'APPROVED' ? 'success' : 'default'}
                    size="small"
                    variant={p.value === 'CANCELLED' ? 'outlined' : 'filled'}
                />
            )
        },
        {
            field: 'actions', headerName: 'Действия', width: 100, sortable: false,
            renderCell: (p) => (
                <Box>
                    <IconButton size="small" onClick={() => setSelectedPayrollId(p.row.id)}
                                title="Посмотреть расчетный лист">
                        <VisibilityIcon/>
                    </IconButton>
                    {p.row.status === 'APPROVED' && (
                        <IconButton size="small" color="error" onClick={() => handleCancel(p.row.id)}
                                    title="Отменить начисление">
                            <CancelIcon/>
                        </IconButton>
                    )}
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" component="h1">Зарплатные ведомости</Typography>
                <Button
                    variant="contained"
                    startIcon={<CalculateIcon/>}
                    onClick={() => setIsCalcOpen(true)}
                    size="large"
                >
                    Рассчитать ЗП
                </Button>
            </Box>

            {/* --- 4. Вставляем панель фильтров --- */}
            <PayrollFilterPanel
                onApply={handleFilterApply}
                isLoading={isFetching}
            />

            <Paper sx={{height: 700, width: '100%'}}>
                <DataGrid
                    rows={data?.content ?? []}
                    columns={columns}
                    rowCount={data?.totalElements ?? 0}
                    loading={isLoading || isFetching}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                        }
                    }}
                />
            </Paper>

            <PayrollCalculationDialog
                open={isCalcOpen}
                onClose={() => setIsCalcOpen(false)}
                onSubmit={handleCalculate}
                isSubmitting={calculate.isPending}
            />

            <PayrollPayslipDialog
                payrollId={selectedPayrollId}
                onClose={() => setSelectedPayrollId(null)}
            />
        </Box>
    );
};