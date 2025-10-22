import {useState} from 'react';
import {Box, Button, CircularProgress, Typography, Alert, IconButton} from '@mui/material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {axiosInstance} from '../../api/axiosInstance.ts';
import {WarehouseForm} from './WarehouseForm';
import type {Warehouse} from './types';
import type {WarehouseFormData} from './WarehouseForm';

const fetchWarehouses = async (): Promise<Warehouse[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const createWarehouse = async (warehouseData: WarehouseFormData): Promise<Warehouse> => {
    const {data} = await axiosInstance.post('/warehouses', warehouseData);
    return data;
};

const updateWarehouse = async (warehouseData: Warehouse): Promise<Warehouse> => {
    const {data} = await axiosInstance.put(`/warehouses`, warehouseData);
    return data;
};


const deleteWarehouse = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/warehouses/${id}`);
};


export const WarehousesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const queryClient = useQueryClient();

    const {data: warehouses, isLoading, isError, error} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const {mutate: addWarehouse, isPending: isCreating} = useMutation({
        mutationFn: createWarehouse,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['warehouses']});
            closeModal();
        },
    });

    const {mutate: editWarehouse, isPending: isEditing} = useMutation({
        mutationFn: updateWarehouse,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['warehouses']});
            closeModal();
        },
    });

    const {mutate: removeWarehouse} = useMutation({
        mutationFn: deleteWarehouse,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['warehouses']});
        },
    });

    const handleEditClick = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот склад?')) {
            removeWarehouse(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWarehouse(null);
    };

    const handleFormSubmit = (formData: WarehouseFormData) => {
        if (editingWarehouse) {
            const updatedWarehouse = {...formData, id: editingWarehouse.id};
            editWarehouse(updatedWarehouse);
        } else {
            addWarehouse(formData);
        }
    };

    const columns: GridColDef[] = [
        {field: 'id', headerName: 'ID', width: 80},
        {field: 'name', headerName: 'Название', flex: 1, minWidth: 100},
        {field: 'location', headerName: 'Расположение', flex: 1, minWidth: 100},
        {field: 'description', headerName: 'Описание', flex: 1, minWidth: 100},
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEditClick(params.row)}>
                        <EditIcon/>
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                        <DeleteIcon/>
                    </IconButton>
                </>
            ),
        },
    ];

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (isError) {
        return <Alert severity="error">Ошибка при загрузке складов: {error.message}</Alert>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Справочник: Склады
                </Typography>
                <Button variant="contained" onClick={() => setIsModalOpen(true)}>
                    Создать склад
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%' }}>
                <DataGrid
                    rows={warehouses ?? []}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                />
            </Box>

            <WarehouseForm
                open={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                isSubmitting={isCreating || isEditing}
                initialData={editingWarehouse}
            />
        </Box>
    );
};