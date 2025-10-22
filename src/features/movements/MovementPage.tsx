import { useState } from 'react';
import { Box, Button, Typography, Alert, ButtonGroup, Autocomplete, TextField, Chip, IconButton } from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useMutation, useQueryClient, useQuery, keepPreviousData } from '@tanstack/react-query';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { axiosInstance } from '../../api/axiosInstance';
import { MovementForm } from './MovementForm';
import { MovementDetailsModal } from './MovementDetailsModal';
import type {
    MovementType,
    StockMovementRequestDto,
    MovementsPageResponse,
    MovementHistoryItem,
    WarehouseOption
} from './types';

const createMovement = async (movementData: StockMovementRequestDto) => {
    const { data } = await axiosInstance.post('/warehouse/movements', movementData);
    return data;
};

const fetchMovementHistory = async (
    paginationModel: GridPaginationModel,
    filters: { warehouseId: number | null }
): Promise<MovementsPageResponse> => {
    const { data } = await axiosInstance.get('/warehouse/movements/history', {
        params: {
            page: paginationModel.page,
            size: paginationModel.pageSize,
            warehouseId: filters.warehouseId,
        },
    });
    return data;
};

const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const { data } = await axiosInstance.get('/warehouses');
    return data;
};

const movementTypeLabels: Record<MovementHistoryItem['movementType'], string> = {
    INBOUND: 'Поступление',
    OUTBOUND: 'Расход',
    ADJUSTMENT: 'Корректировка',
    TRANSFER_IN: 'Перемещение (Приход)',
    TRANSFER_OUT: 'Перемещение (Расход)',
};

const renderMovementType = (type: MovementHistoryItem['movementType']) => {
    const colorMap: Record<typeof type, 'success' | 'error' | 'warning' | 'info' | 'primary'> = {
        INBOUND: 'success',
        OUTBOUND: 'error',
        ADJUSTMENT: 'warning',
        TRANSFER_IN: 'info',
        TRANSFER_OUT: 'primary',
    };
    return <Chip label={movementTypeLabels[type]} color={colorMap[type]} size="small" />;
};

export const MovementsPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState<MovementHistoryItem | null>(null);
    const [movementType, setMovementType] = useState<MovementType>('INBOUND');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [warehouseFilterId, setWarehouseFilterId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const { data: warehouses = [], isLoading: isLoadingWarehouses } = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const {
        data: historyPage,
        isError,
        error: historyError,
        isFetching,
    } = useQuery<MovementsPageResponse, Error>({
        queryKey: ['movementsHistory', paginationModel, warehouseFilterId],
        queryFn: () => fetchMovementHistory(paginationModel, { warehouseId: warehouseFilterId }),
        placeholderData: keepPreviousData,
        enabled: !!warehouseFilterId,
    });

    const { mutate: addMovement, isPending: isCreating, error: createError } = useMutation({
        mutationFn: createMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['movementsHistory'] });
            setIsFormOpen(false);
        },
    });

    const handleOpenForm = (type: MovementType) => {
        setMovementType(type);
        setIsFormOpen(true);
    };

    const handleOpenDetails = (movement: MovementHistoryItem) => {
        setSelectedMovement(movement);
    };

    const columns: GridColDef<MovementHistoryItem>[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'movementType',
            headerName: 'Тип операции',
            width: 200,
            renderCell: (params) => renderMovementType(params.value),
        },
        { field: 'warehouseName', headerName: 'Склад', flex: 1 },
        { field: 'comment', headerName: 'Комментарий', flex: 2 },
        {
            field: 'movementTime',
            headerName: 'Дата',
            width: 180,
            renderCell: (params) => {
                return params.value ? new Date(params.value).toLocaleString() : '';
            }
        },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 100,
            renderCell: (params) => (
                <IconButton onClick={() => handleOpenDetails(params.row)}>
                    <VisibilityIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Складские операции
                </Typography>
                <ButtonGroup variant="contained">
                    <Button onClick={() => handleOpenForm('INBOUND')}>Приход</Button>
                    <Button onClick={() => handleOpenForm('OUTBOUND')}>Расход</Button>
                    <Button onClick={() => handleOpenForm('ADJUSTMENT')}>Корректировка</Button>
                </ButtonGroup>
            </Box>

            {createError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Ошибка при создании операции: {(createError as Error).message}
                </Alert>
            )}

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>История движений</Typography>
                <Autocomplete
                    options={warehouses}
                    getOptionLabel={(option) => option.name}
                    value={warehouses.find(w => w.id === warehouseFilterId) || null}
                    onChange={(_, newValue) => {
                        setWarehouseFilterId(newValue?.id || null);
                        setPaginationModel(prev => ({ ...prev, page: 0 }));
                    }}
                    loading={isLoadingWarehouses}
                    sx={{ width: 300, mb: 2 }}
                    renderInput={(params) => <TextField {...params} label="Выберите склад для просмотра истории" />}
                />

                <Box sx={{ height: 600, width: '100%' }}>
                    {!warehouseFilterId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed grey', borderRadius: 1 }}>
                            <Typography color="text.secondary">Выберите склад</Typography>
                        </Box>
                    ) : (
                        <>
                            {isError && <Alert severity="error">Ошибка при загрузке истории: {(historyError as Error).message}</Alert>}
                            <DataGrid
                                rows={historyPage?.content ?? []}
                                columns={columns}
                                getRowId={(row) => row.id}
                                paginationMode="server"
                                rowCount={historyPage?.totalElements ?? 0}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[10, 25, 50]}
                                loading={isFetching}
                                disableRowSelectionOnClick
                            />
                        </>
                    )}
                </Box>
            </Box>

            <MovementForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={addMovement}
                isSubmitting={isCreating}
                movementType={movementType}
            />

            <MovementDetailsModal
                movement={selectedMovement}
                onClose={() => setSelectedMovement(null)}
            />
        </Box>
    );
};