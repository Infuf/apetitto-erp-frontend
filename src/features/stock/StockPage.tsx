import {useState, useEffect} from 'react';
import {
    Box,
    Typography,
    Alert,
    TextField,
    Autocomplete,
} from '@mui/material';
import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
} from '@mui/x-data-grid';
import {
    useQuery,
    keepPreviousData,
} from '@tanstack/react-query';
import {axiosInstance} from '../../api/axiosInstance';
import type {StockItem, StockPageResponse, WarehouseOption, CategoryOption} from './types';


const fetchStock = async (
    paginationModel: GridPaginationModel,
    filters: { warehouseId: number | null; categoryId: number | null; searchQuery: string }
): Promise<StockPageResponse> => {
    const {data} = await axiosInstance.get('/warehouse/stock', {
        params: {
            page: paginationModel.page,
            size: paginationModel.pageSize,
            warehouseId: filters.warehouseId,
            categoryId: filters.categoryId,
            searchQuery: filters.searchQuery,
        },
    });
    return data;
};

const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const fetchCategories = async (): Promise<CategoryOption[]> => {
    const {data} = await axiosInstance.get('/categories');
    return data;
};

export const StockPage = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const [filters, setFilters] = useState<{
        warehouseId: number | null;
        categoryId: number | null;
        searchQuery: string;
    }>({
        warehouseId: null,
        categoryId: null,
        searchQuery: '',
    });

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(filters.searchQuery);
            setPaginationModel((prev) => ({...prev, page: 0}));
        }, 500);
        return () => clearTimeout(handler);
    }, [filters.searchQuery]);

    const {data: warehouses = [], isLoading: isLoadingWarehouses} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const {data: categories = [], isLoading: isLoadingCategories} = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const {
        data: stockPage,
        isError,
        error,
        isFetching,
    } = useQuery<StockPageResponse, Error>({
        queryKey: ['stock', paginationModel, filters.warehouseId, filters.categoryId, debouncedSearchQuery],
        queryFn: () => fetchStock(paginationModel, {...filters, searchQuery: debouncedSearchQuery}),
        placeholderData: keepPreviousData,
        enabled: !!filters.warehouseId,
    });

    const columns: GridColDef<StockItem>[] = [
        {field: 'productCode', headerName: 'Артикул', width: 150},
        {field: 'productName', headerName: 'Название', flex: 1, minWidth: 200},
        {field: 'quantity', headerName: 'Количество', width: 130},
        {field: 'unit', headerName: 'Ед. изм.', width: 100},
        {field: 'averageCost', headerName: 'Себестоимость', width: 150},
    ];

    if (isError) {
        return <Alert severity="error">Ошибка при загрузке: {(error as Error).message}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{mb: 2}}>
                Остатки на складах
            </Typography>

            <Box sx={{display: 'flex', gap: 2, mb: 2, alignItems: 'center'}}>
                <Autocomplete
                    options={warehouses}
                    getOptionLabel={(option) => option.name}
                    value={warehouses.find(w => w.id === filters.warehouseId) || null}
                    onChange={(_, newValue) => {
                        setFilters(prev => ({...prev, warehouseId: newValue?.id || null}));
                        setPaginationModel(prev => ({...prev, page: 0}));
                    }}
                    loading={isLoadingWarehouses}
                    sx={{width: 300}}
                    renderInput={(params) => <TextField {...params} label="Склад (обязательно)"/>}
                />
                <Autocomplete
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    value={categories.find(c => c.id === filters.categoryId) || null}
                    onChange={(_, newValue) => {
                        setFilters(prev => ({...prev, categoryId: newValue?.id || null}));
                        setPaginationModel(prev => ({...prev, page: 0}));
                    }}
                    loading={isLoadingCategories}
                    sx={{width: 300}}
                    renderInput={(params) => <TextField {...params} label="Категория"/>}
                />
                <TextField
                    label="Поиск по названию/артикулу"
                    variant="outlined"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({...prev, searchQuery: e.target.value}))}
                    sx={{flexGrow: 1}}
                />
            </Box>

            <Box sx={{height: 650, width: '100%'}}>
                {!filters.warehouseId ? (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        border: '1px dashed grey',
                        borderRadius: 1
                    }}>
                        <Typography color="text.secondary">Выберите склад для просмотра остатков</Typography>
                    </Box>
                ) : (
                    <DataGrid
                        rows={stockPage?.content ?? []}
                        columns={columns}
                        getRowId={(row) => row.productId}
                        paginationMode="server"
                        rowCount={stockPage?.totalElements ?? 0}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[10, 25, 50]}
                        loading={isFetching}
                        disableRowSelectionOnClick
                    />
                )}
            </Box>
        </Box>
    );
};