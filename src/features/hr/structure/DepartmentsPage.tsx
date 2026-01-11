import {useState} from 'react';
import {Alert, Box, Button, CircularProgress, IconButton, Paper, Typography} from '@mui/material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {useDepartments} from '../hooks/useDepartments.ts';
import {DepartmentForm} from './DeparmentForm.tsx';
import type {Department, DepartmentFormData} from '../types';

export const DepartmentsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

    const {
        departments,
        isLoading,
        isError,
        error,
        createDepartment,
        updateDepartment,
        deleteDepartment
    } = useDepartments();

    const handleCreate = () => {
        setEditingDepartment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dept: Department) => {
        setEditingDepartment(dept);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Вы уверены? Это действие не удалит сотрудников, но отвяжет их.')) {
            deleteDepartment.mutate(id);
        }
    };

    const handleSubmit = (data: DepartmentFormData) => {
        if (editingDepartment) {
            updateDepartment.mutate({id: editingDepartment.id, dto: data}, {onSuccess: closeModal});
        } else {
            createDepartment.mutate(data, {onSuccess: closeModal});
        }
    };

    const closeModal = () => setIsModalOpen(false);

    const columns: GridColDef<Department>[] = [
        {field: 'id', headerName: 'ID', width: 70},
        {field: 'name', headerName: 'Название', flex: 1},
        {field: 'description', headerName: 'Описание', flex: 2},
        {
            field: 'managerName',
            headerName: 'Руководитель',
            flex: 1,
            valueGetter: (value: string | null) => value || '—'
        },
        {
            field: 'actions',
            headerName: 'Действия',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEdit(params.row)}>
                        <EditIcon/>
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon/>
                    </IconButton>
                </Box>
            )
        }
    ];

    if (isLoading) return <CircularProgress/>;
    if (isError) return <Alert severity="error">Ошибка: {(error as Error).message}</Alert>;

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" component="h1">Структура компании</Typography>
                <Button variant="contained" startIcon={<AddIcon/>} onClick={handleCreate}>
                    Создать отдел
                </Button>
            </Box>

            <Paper sx={{height: 600, width: '100%'}}>
                <DataGrid
                    rows={departments}
                    columns={columns}
                    disableRowSelectionOnClick
                    hideFooter
                />
            </Paper>

            <DepartmentForm
                open={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                isSubmitting={createDepartment.isPending || updateDepartment.isPending}
                initialData={editingDepartment}
            />
        </Box>
    );
};