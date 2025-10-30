import {useState} from 'react';
import {Box, Typography, Alert, Button, IconButton, Chip, Paper, TextField} from '@mui/material';
import {DataGrid, type GridColDef, type GridPaginationModel} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';

import {useTransfers} from './hooks/useTransfers';
import {formatAppDate} from '../../lib/formatDate';
import {TransferDetailsModal} from './TransferDetailsModal';
import {TransferForm} from './TransferForm';
import type {TransferOrder, TransferFilters, TransferOrderRequestDto} from './types';

const statusInfo: Record<TransferOrder['status'], {
    label: string;
    color: 'default' | 'info' | 'success' | 'error'
}> = {
    PENDING: {label: 'Ожидает отправки', color: 'default'},
    SHIPPED: {label: 'В пути', color: 'info'},
    RECEIVED: {label: 'Принят', color: 'success'},
    CANCELLED: {label: 'Отменен', color: 'error'},
};

export const TransfersDesktopPage = () => {
    const {usePaginatedTransfers, create, ship, receive} = useTransfers();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({page: 0, pageSize: 10});
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [filterInputs, setFilterInputs] = useState<TransferFilters>({dateFrom: null, dateTo: null});
    const [activeFilters, setActiveFilters] = useState<TransferFilters>({dateFrom: null, dateTo: null});

    const {data: transfersPage, isFetching, isError, error} = usePaginatedTransfers(
        paginationModel.page,
        paginationModel.pageSize,
        activeFilters
    );

    const handleApplyFilters = () => {
        setPaginationModel(prev => ({...prev, page: 0}));
        setActiveFilters(filterInputs);
    };

    const handleFormSubmit = (formData: TransferOrderRequestDto) => {
        create.mutate(formData, {
            onSuccess: () => setIsCreateModalOpen(false),
        });
    };

    const handleShip = (id: number) => {
        if (window.confirm(`Вы уверены, что хотите отправить перемещение #${id}?`)) {
            ship.mutate(id);
        }
    };

    const handleReceive = (id: number) => {
        if (window.confirm(`Вы уверены, что хотите принять перемещение #${id}?`)) {
            receive.mutate(id);
        }
    };

    const columns: GridColDef<TransferOrder>[] = [
        {field: 'id', headerName: 'ID', width: 90},
        {
            field: 'status',
            headerName: 'Статус',
            width: 180,
            renderCell: (params) => {
                const status = params.value as TransferOrder['status'];
                const info = statusInfo[status];
                if (!info) return null;
                return <Chip label={info.label} color={info.color} size="small"/>;
            },
        },
        {field: 'sourceWarehouseName', headerName: 'Откуда', flex: 1, minWidth: 150},
        {field: 'destinationWarehouseName', headerName: 'Куда', flex: 1, minWidth: 150},
        {
            field: 'createdAt',
            headerName: 'Дата создания',
            width: 180,
            renderCell: (params) => formatAppDate(params.value),
        },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => setSelectedTransferId(params.row.id)} title="Просмотр">
                        <VisibilityIcon/>
                    </IconButton>
                    {params.row.status === 'PENDING' && (
                        <IconButton onClick={() => handleShip(params.row.id)} color="primary" title="Отправить"
                                    disabled={ship.isPending}>
                            <LocalShippingIcon/>
                        </IconButton>
                    )}
                    {params.row.status === 'SHIPPED' && (
                        <IconButton onClick={() => handleReceive(params.row.id)} color="success" title="Принять"
                                    disabled={receive.isPending}>
                            <CheckCircleOutlineIcon/>
                        </IconButton>
                    )}
                </Box>
            ),
        },
    ];

    if (isError) {
        return <Alert severity="error">Ошибка при загрузке перемещений: {(error as Error).message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h4" component="h1">Перемещения</Typography>
                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => setIsCreateModalOpen(true)}>
                    Создать перемещение
                </Button>
            </Box>

            <Paper sx={{p: 2, mb: 2}}>
                <Typography variant="h6" gutterBottom>Фильтры</Typography>
                <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                    <TextField
                        label="Дата с"
                        type="date"
                        value={filterInputs.dateFrom || ''}
                        onChange={(e) => setFilterInputs(prev => ({...prev, dateFrom: e.target.value || null}))}
                        InputLabelProps={{shrink: true}}
                        size="small"
                    />
                    <TextField
                        label="Дата по"
                        type="date"
                        value={filterInputs.dateTo || ''}
                        onChange={(e) => setFilterInputs(prev => ({...prev, dateTo: e.target.value || null}))}
                        InputLabelProps={{shrink: true}}
                        size="small"
                    />
                    <Button
                        variant="outlined"
                        startIcon={<SearchIcon/>}
                        onClick={handleApplyFilters}
                    >
                        Найти
                    </Button>
                </Box>
            </Paper>

            <Box sx={{height: 650, width: '100%'}}>
                <DataGrid
                    rows={transfersPage?.content ?? []}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    sortingMode="client"
                    rowCount={transfersPage?.totalElements ?? 0}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    loading={isFetching}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    initialState={{
                        sorting: {
                            sortModel: [{field: 'createdAt', sort: 'desc'}],
                        },
                    }}
                />
            </Box>

            <TransferDetailsModal
                transferId={selectedTransferId}
                onClose={() => setSelectedTransferId(null)}
            />

            {isCreateModalOpen && (
                <TransferForm
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    isSubmitting={create.isPending}
                />
            )}
        </Box>
    );
};