import {useState} from 'react';
import {Alert, Autocomplete, Box, Button, ButtonGroup, Chip, IconButton, TextField, Typography} from '@mui/material';
import {DataGrid, type GridColDef, type GridPaginationModel} from '@mui/x-data-grid';
import {keepPreviousData, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {axiosInstance} from '../../api/axiosInstance';
import {MovementForm} from './MovementForm';
import {MovementDetailsModal} from './MovementDetailsModal';
import type {
    MovementHistoryItem,
    MovementsPageResponse,
    MovementType,
    StockMovementRequestDto,
    WarehouseOption
} from './types';
import SearchIcon from "@mui/icons-material/Search";

const createMovement = async (movementData: StockMovementRequestDto) => {
    const {data} = await axiosInstance.post('/warehouse/movements', movementData);
    return data;
};

const fetchMovementHistory = async (
    paginationModel: GridPaginationModel,
    filters: { warehouseId: number | null; dateFrom?: string | null; dateTo?: string | null }
): Promise<MovementsPageResponse> => {

    const {warehouseId, dateFrom, dateTo} = filters;

    const params: Record<string, string | number | undefined> = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        warehouseId: warehouseId ?? undefined,
        sort: 'movementTime,desc',
    };

    if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from.getTime())) {
            from.setUTCHours(0, 0, 0, 0);
            params.dateFrom = from.toISOString();
        }
    }

    if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to.getTime())) {
            to.setUTCHours(23, 59, 59, 999);
            params.dateTo = to.toISOString();
        }
    }

    const {data} = await axiosInstance.get<MovementsPageResponse>('/warehouse/movements/history', {params});
    return data;
};

const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const movementTypeLabels: Record<MovementHistoryItem['movementType'], string> = {
    INBOUND: 'Поступление',
    OUTBOUND: 'Расход',
    ADJUSTMENT: 'Корректировка',
    TRANSFER_IN: 'Перемещение (Приход)',
    TRANSFER_OUT: 'Перемещение (Расход)',
    SELL: 'Продажа',
};

const renderMovementType = (type: MovementHistoryItem['movementType']) => {
    const colorMap: Record<typeof type, 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary'> = {
        INBOUND: 'success',
        OUTBOUND: 'error',
        ADJUSTMENT: 'warning',
        TRANSFER_IN: 'info',
        TRANSFER_OUT: 'primary',
        SELL: 'secondary',
    };
    return <Chip label={movementTypeLabels[type]} color={colorMap[type]} size="small"/>;
};

export const MovementsPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState<MovementHistoryItem | null>(null);
    const [movementType, setMovementType] = useState<MovementType>('INBOUND');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({page: 0, pageSize: 10});
    const [warehouseFilterId, setWarehouseFilterId] = useState<number | null>(null);

    const [dateFrom, setDateFrom] = useState<string | null>(null);
    const [dateTo, setDateTo] = useState<string | null>(null);
    const [searchTrigger, setSearchTrigger] = useState(0);

    const queryClient = useQueryClient();

    const {data: warehouses = [], isLoading: isLoadingWarehouses} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const {
        data: historyPage,
        isError,
        error: historyError,
        isFetching,
    } = useQuery<MovementsPageResponse, Error>({
        queryKey: ['movementsHistory', paginationModel, warehouseFilterId, searchTrigger],
        queryFn: () => fetchMovementHistory(paginationModel, {
            warehouseId: warehouseFilterId,
            dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
            dateTo: dateTo ? new Date(dateTo).toISOString() : null,
        }),
        placeholderData: keepPreviousData,
        enabled: !!warehouseFilterId,
    });

    const {mutate: addMovement, isPending: isCreating, error: createError} = useMutation({
        mutationFn: createMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['stock']});
            queryClient.invalidateQueries({queryKey: ['movementsHistory']});
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
        {field: 'id', headerName: 'ID', width: 90},
        {
            field: 'movementType',
            headerName: 'Тип операции',
            width: 200,
            renderCell: (params) => renderMovementType(params.value),
        },
        {field: 'warehouseName', headerName: 'Склад', flex: 1},
        {field: 'comment', headerName: 'Комментарий', flex: 2},
        {
            field: 'movementTime',
            headerName: 'Дата',
            width: 180,
            renderCell: (params) => (params.value ? new Date(params.value).toLocaleString() : ''),
        },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 100,
            renderCell: (params) => (
                <IconButton onClick={() => handleOpenDetails(params.row)}>
                    <VisibilityIcon/>
                </IconButton>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
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
                <Alert severity="error" sx={{mb: 2}}>
                    Ошибка при создании операции: {(createError as Error).message}
                </Alert>
            )}

            <Box sx={{mt: 4}}>
                <Typography variant="h5" sx={{mb: 2}}>История движений</Typography>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap'}}>
                    <Autocomplete
                        options={warehouses}
                        getOptionLabel={(option) => option.name}
                        value={warehouses.find(w => w.id === warehouseFilterId) || null}
                        onChange={(_, newValue) => {
                            setWarehouseFilterId(newValue?.id || null);
                            setPaginationModel(prev => ({...prev, page: 0}));
                        }}
                        loading={isLoadingWarehouses}
                        sx={{width: 250}}
                        renderInput={(params) => <TextField {...params} label="Склад"/>}
                    />

                    <TextField
                        label="Дата c"
                        type="date"
                        value={dateFrom || ''}
                        onChange={(e) => setDateFrom(e.target.value || null)}
                        InputLabelProps={{shrink: true}}
                        sx={{width: 180}}
                    />
                    <TextField
                        label="Дата по"
                        type="date"
                        value={dateTo || ''}
                        onChange={(e) => setDateTo(e.target.value || null)}
                        InputLabelProps={{shrink: true}}
                        sx={{width: 180}}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<SearchIcon/>}
                        onClick={() => {
                            setPaginationModel({page: 0, pageSize: paginationModel.pageSize});
                            setSearchTrigger(prev => prev + 1);
                        }}
                        disabled={!warehouseFilterId}
                    >
                        Найти
                    </Button>
                </Box>

                <Box sx={{height: 600, width: '100%'}}>
                    {!warehouseFilterId ? (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            border: '1px dashed grey',
                            borderRadius: 1
                        }}>
                            <Typography color="text.secondary">Выберите склад</Typography>
                        </Box>
                    ) : (
                        <>
                            {isError && <Alert severity="error">Ошибка при загрузке
                                истории: {(historyError as Error).message}</Alert>}
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
