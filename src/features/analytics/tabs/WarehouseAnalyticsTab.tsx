import {useMemo, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    Grid,
    LinearProgress,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import {endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays} from 'date-fns';
import {useQuery} from '@tanstack/react-query';

import {useWarehouseAnalytics} from '../../stock/hooks/useWarehouseAnalytics';
import {formatCurrency} from '../../../lib/formatCurrency';
import {axiosInstance} from '../../../api/axiosInstance';
import type {DashboardStockItemDto, IncomingStockReportDto, WarehouseOption} from '../../stock/types';

const fetchWarehousesList = async (): Promise<WarehouseOption[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF8042'];

export const WarehouseAnalyticsTab = () => {
    // --- 1. Глобальные фильтры дат ---
    const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

    const isoDateFrom = new Date(dateFrom + 'T00:00:00').toISOString();
    const isoDateTo = new Date(dateTo + 'T23:59:59.999').toISOString();

    // --- 2. Раздельные состояния для складов ---
    const [valuationWarehouses, setValuationWarehouses] = useState<WarehouseOption[]>([]);
    const [incomingWarehouses, setIncomingWarehouses] = useState<WarehouseOption[]>([]);

    const {useStockValuation, useIncomingReport} = useWarehouseAnalytics();

    const {data: warehouseList = []} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehousesList
    });

    // --- 3. Запросы данных ---
    const valuationIds = valuationWarehouses.map(w => w.id);
    const {
        data: valuationData,
        isLoading: isValuationLoading,
        refetch: refetchValuation
    } = useStockValuation(valuationIds);

    const incomingIds = incomingWarehouses.length > 0 ? incomingWarehouses.map(w => w.id) : undefined;
    const {
        data: incomingData,
        isLoading: isIncomingLoading,
        refetch: refetchIncoming
    } = useIncomingReport(isoDateFrom, isoDateTo, incomingIds);

    const isLoading = isIncomingLoading || isValuationLoading;

    const handleRefresh = () => {
        refetchIncoming();
        if (valuationIds.length > 0) refetchValuation();
    };


    const valuationChartData = useMemo(() => {
        if (!valuationData) return [];
        return valuationData.reduce((acc, item) => {
            const existing = acc.find(x => x.name === item.warehouseName);
            if (existing) {
                existing.value += item.calculatedValue;
            } else {
                acc.push({name: item.warehouseName, value: item.calculatedValue});
            }
            return acc;
        }, [] as { name: string, value: number }[]);
    }, [valuationData]);

    const totalValuation = valuationChartData.reduce((sum, item) => sum + item.value, 0);

    const topProductsByValue = useMemo(() => {
        if (!valuationData) return [];
        return [...valuationData]
            .sort((a, b) => b.calculatedValue - a.calculatedValue);
    }, [valuationData]);


    const totalIncomingAmount = useMemo(() => {
        if (!incomingData) return 0;
        return incomingData.reduce((sum, item) => sum + item.totalAmount, 0);
    }, [incomingData]);


    const handleQuickFilter = (type: 'today' | 'yesterday' | 'week' | 'month') => {
        const now = new Date();
        let start = now;
        let end = now;
        switch (type) {
            case 'today':
                start = now;
                end = now;
                break;
            case 'yesterday':
                start = subDays(now, 1);
                end = subDays(now, 1);
                break;
            case 'week':
                start = startOfWeek(now, {weekStartsOn: 1});
                end = endOfWeek(now, {weekStartsOn: 1});
                break;
            case 'month':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
        }
        setDateFrom(format(start, 'yyyy-MM-dd'));
        setDateTo(format(end, 'yyyy-MM-dd'));
    };


    const incomingColumns: GridColDef<IncomingStockReportDto>[] = [
        {field: 'warehouseName', headerName: 'Склад', flex: 1},
        {field: 'productName', headerName: 'Товар', flex: 1.5},
        {field: 'totalQuantity', headerName: 'Кол-во', width: 90},
        {
            field: 'pricePerUnit',
            headerName: 'Цена (ср.)',
            width: 120,
            renderCell: (p) => formatCurrency(p.value)
        },
        {
            field: 'totalAmount',
            headerName: 'Сумма',
            width: 140,
            renderCell: (p) => <span style={{fontWeight: 'bold'}}>{formatCurrency(p.value)}</span>
        },
    ];

    // НОВЫЕ КОЛОНКИ: Для структуры склада
    const valuationColumns: GridColDef<DashboardStockItemDto>[] = [
        {field: 'productName', headerName: 'Товар', flex: 1.5},
        {field: 'warehouseName', headerName: 'Склад', flex: 1},
        {field: 'quantity', headerName: 'Остаток', width: 90},
        {
            field: 'valuationType',
            headerName: 'Метод',
            width: 80,
            renderCell: (p) => (
                <span style={{
                    color: p.value === 'COST' ? 'green' : 'orange',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    {p.value === 'COST' ? 'СЕБЕСТ.' : 'ЦЕНА'}
                </span>
            )
        },
        {
            field: 'calculatedValue',
            headerName: 'Стоимость',
            width: 140,
            renderCell: (p) => <span style={{fontWeight: 'bold'}}>{formatCurrency(p.value)}</span>
        },
    ];

    return (
        <Box>
            {/* --- ПАНЕЛЬ ФИЛЬТРОВ --- */}
            <Paper sx={{p: 2, mb: 3}}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                    <Grid>
                        <Typography variant="h6">Период отчетов</Typography>
                    </Grid>
                    <Grid>
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end'
                        }}>
                            <ButtonGroup variant="outlined" size="small" disabled={isLoading}>
                                <Button onClick={() => handleQuickFilter('today')}>Сегодня</Button>
                                <Button onClick={() => handleQuickFilter('yesterday')}>Вчера</Button>
                                <Button onClick={() => handleQuickFilter('week')}>Неделя</Button>
                                <Button onClick={() => handleQuickFilter('month')}>Месяц</Button>
                            </ButtonGroup>
                            <TextField
                                label="С" type="date" size="small"
                                value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                InputLabelProps={{shrink: true}} sx={{width: 130}} disabled={isLoading}
                            />
                            <TextField
                                label="По" type="date" size="small"
                                value={dateTo} onChange={e => setDateTo(e.target.value)}
                                InputLabelProps={{shrink: true}} sx={{width: 130}} disabled={isLoading}
                            />
                            <Button variant="contained" onClick={handleRefresh} disabled={isLoading}>
                                <RefreshIcon/>
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{height: 4, mb: 3}}>{isLoading && <LinearProgress/>}</Box>

            <Grid container spacing={3}>
                <Grid size={{xs: 12}}>
                    <Paper sx={{p: 2, minHeight: 400}}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2
                        }}>
                            <Box>
                                <Typography variant="h6">Журнал поступлений</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Товары, поступившие за выбранный период (Закупка)
                                </Typography>
                            </Box>
                            <Box sx={{textAlign: 'right'}}>
                                <Typography variant="caption" color="text.secondary">Итого
                                    поступило:</Typography>
                                <Typography variant="h5" color="success.main" fontWeight="bold">
                                    {formatCurrency(totalIncomingAmount)}
                                </Typography>
                            </Box>
                        </Box>

                        <Autocomplete
                            multiple
                            options={warehouseList}
                            getOptionLabel={(option) => option.name}
                            value={incomingWarehouses}
                            onChange={(_, newValue) => setIncomingWarehouses(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Фильтр по складам" placeholder="Все склады"
                                           size="small"/>
                            )}
                            sx={{mb: 2, maxWidth: 500}}
                        />

                        <Box sx={{height: 400, width: '100%'}}>
                            <DataGrid
                                rows={incomingData || []}
                                columns={incomingColumns}
                                getRowId={(row) => `${row.warehouseName}-${row.productName}`}
                                loading={isIncomingLoading}
                                density="compact"
                                disableRowSelectionOnClick
                                initialState={{
                                    pagination: {paginationModel: {pageSize: 10}},
                                }}
                                pageSizeOptions={[10, 25, 50]}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Теперь этот блок занимает всю ширину, чтобы вместить и график, и таблицу */}
                <Grid size={{xs: 12}}>
                    <Paper sx={{p: 2, minHeight: 500}}>
                        <Typography variant="h6" gutterBottom>Структура стоимости склада</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                            Показывает, в каких товарах "заморожены" деньги.
                        </Typography>

                        <Autocomplete
                            multiple
                            options={warehouseList}
                            getOptionLabel={(option) => option.name}
                            value={valuationWarehouses}
                            onChange={(_, newValue) => setValuationWarehouses(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Выберите склады для оценки" placeholder="Склады..."
                                           size="small"/>
                            )}
                            sx={{mb: 3, maxWidth: 600}}
                        />

                        {valuationWarehouses.length === 0 ? (
                            <Box sx={{
                                height: 300,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed grey',
                                borderRadius: 1
                            }}>
                                <Typography color="text.secondary" align="center">
                                    Выберите склады,<br/>чтобы увидеть анализ остатков.
                                </Typography>
                            </Box>
                        ) : isValuationLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', p: 5}}><CircularProgress/></Box>
                        ) : (
                            <Grid container spacing={3}>
                                {/* График: Распределение по складам */}
                                <Grid size={{xs: 12, md: 4}}>
                                    <Box sx={{textAlign: 'center', mb: 2}}>
                                        <Typography variant="subtitle2" color="text.secondary">Всего на
                                            складах:</Typography>
                                        <Typography variant="h4" color="primary" fontWeight="bold">
                                            {formatCurrency(totalValuation)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{height: 300, width: '100%'}}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={valuationChartData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    paddingAngle={5}
                                                >
                                                    {valuationChartData.map((_, index) => (
                                                        <Cell key={`cell-${index}`}
                                                              fill={COLORS[index % COLORS.length]}/>
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) =>
                                                        value == null ? '' : formatCurrency(Number(value))
                                                    }
                                                />
                                                <Legend verticalAlign="bottom"/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Grid>

                                {/* Таблица: Топ товаров (Детализация денег) */}
                                <Grid size={{xs: 12, md: 8}}>
                                    <Typography variant="subtitle2" gutterBottom>Детализация по товарам (Топ по
                                        стоимости)</Typography>
                                    <Box sx={{height: 400, width: '100%'}}>
                                        <DataGrid
                                            rows={topProductsByValue}
                                            columns={valuationColumns}
                                            getRowId={(row) => `${row.warehouseName}-${row.productName}`}
                                            disableRowSelectionOnClick
                                            initialState={{
                                                pagination: {paginationModel: {pageSize: 10}},
                                                sorting: {sortModel: [{field: 'calculatedValue', sort: 'desc'}]}
                                            }}
                                            pageSizeOptions={[10, 25, 50]}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>


            </Grid>
        </Box>
    );
};