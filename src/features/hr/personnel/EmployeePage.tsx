import {useState} from 'react';
import {Alert, Box, Button, Chip, CircularProgress, IconButton, Paper, Typography} from '@mui/material';
import {DataGrid, type GridColDef, type GridPaginationModel} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import {useEmployees} from '../hooks/useEmployees';
import {EmployeeForm} from './EmployeeForm';
import {formatCurrency} from '../../../lib/formatCurrency';
import type {Employee, EmployeeCreateDto, EmployeeUpdateDto} from '../types';
import {EmployeeDismissDialog} from "./EmployeeDismissDialog.tsx";

export const EmployeesPage = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({page: 0, pageSize: 25});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const {usePaginatedEmployees, createEmployee, updateEmployee, dismissEmployee} = useEmployees();

    const {data, isLoading, isError, error, isFetching} = usePaginatedEmployees(
        paginationModel.page,
        paginationModel.pageSize
    );

    const handleCreate = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };
    const [employeeToDismiss, setEmployeeToDismiss] = useState<Employee | null>(null);

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };
    const handleDismissClick = (employee: Employee) => {
        setEmployeeToDismiss(employee);
    };
    const handleConfirmDismiss = (id: number) => {
        dismissEmployee.mutate(id, {
            onSuccess: () => setEmployeeToDismiss(null)
        });
    };

    const handleFormSubmit = (dto: EmployeeCreateDto | EmployeeUpdateDto) => {
        if (editingEmployee) {
            updateEmployee.mutate({id: editingEmployee.id, dto: dto as EmployeeUpdateDto}, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createEmployee.mutate(dto as EmployeeCreateDto, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const columns: GridColDef<Employee>[] = [
        {field: 'id', headerName: 'ID', width: 70},
        {field: 'fullName', headerName: 'ФИО', flex: 1.5},
        {
            field: 'isActive', headerName: 'Статус', width: 120,
            renderCell: (p) => p.value
                ? <Chip label="Активен" color="success" size="small"/>
                : <Chip label="Уволен" color="default" size="small"/>
        },
        {field: 'departmentName', headerName: 'Отдел', flex: 1},
        {field: 'positionTitle', headerName: 'Должность', flex: 1},
        {field: 'username', headerName: 'Логин', width: 120},
        {
            field: 'salaryBase', headerName: 'Ставка', width: 120,
            renderCell: (p) => formatCurrency(p.value)
        },
        {
            field: 'actions', headerName: '', width: 100, sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEdit(params.row)}>
                        <EditIcon/>
                    </IconButton>
                    {params.row.isActive && (
                        <IconButton size="small" color="error" title="Уволить"
                                    onClick={() => handleDismissClick(params.row)}>
                            <BlockIcon/>
                        </IconButton>
                    )}
                </Box>
            )
        }
    ];

    if (isLoading) return <CircularProgress/>;
    if (isError) return <Alert severity="error">{(error as Error).message}</Alert>;

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" component="h1">Сотрудники</Typography>
                <Button variant="contained" startIcon={<AddIcon/>} onClick={handleCreate}>
                    Нанять сотрудника
                </Button>
            </Box>

            <Paper sx={{height: 700, width: '100%'}}>
                <DataGrid
                    rows={data?.content ?? []}
                    columns={columns}
                    rowCount={data?.totalElements ?? 0}
                    loading={isFetching}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableRowSelectionOnClick
                />
            </Paper>

            <EmployeeForm
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                isSubmitting={createEmployee.isPending || updateEmployee.isPending}
                initialData={editingEmployee}
            />
            <EmployeeDismissDialog
                employee={employeeToDismiss}
                onClose={() => setEmployeeToDismiss(null)}
                onConfirm={handleConfirmDismiss}
                isDeleting={dismissEmployee.isPending}
            />
        </Box>
    );
};