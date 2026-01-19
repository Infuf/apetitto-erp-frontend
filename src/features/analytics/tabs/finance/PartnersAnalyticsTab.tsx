import {useMemo, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import {endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays} from 'date-fns';

import {useFinanceAnalytics} from '../../../finance/hooks/useFinanceAnalytics';
import {formatCurrency} from '../../../../lib/formatCurrency';
import {PartnerProductTable} from './PartnerProductTable';
import type {PartnerDto} from '../../../finance/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

export const PartnersAnalyticsTab = () => {
    const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reportType, setReportType] = useState<'SUPPLIER' | 'DEALER' | null>('DEALER');

    const [selectedPartner, setSelectedPartner] = useState<PartnerDto | null>(null);

    const isoDateFrom = new Date(dateFrom + 'T00:00:00').toISOString();
    const isoDateTo = new Date(dateTo + 'T23:59:59.999').toISOString();

    const {usePartnerAnalysis} = useFinanceAnalytics();
    const {data, isLoading, isError, error, refetch} = usePartnerAnalysis(isoDateFrom, isoDateTo, reportType);

    const handleQuickFilter = (type: 'today' | 'yesterday' | 'week' | 'month') => {
        const now = new Date();
        let start = now, end = now;
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

    const chartData = useMemo(() => {
        if (!data?.partners) return [];
        const sorted = [...data.partners].sort((a, b) => b.totalAmount - a.totalAmount);
        const top = sorted.slice(0, 7);
        const others = sorted.slice(7);

        const result = top.map(p => ({name: p.partnerName, value: p.totalAmount}));
        if (others.length > 0) {
            const othersSum = others.reduce((sum, p) => sum + p.totalAmount, 0);
            result.push({name: 'Прочие', value: othersSum});
        }
        return result;
    }, [data]);

    const columns: GridColDef<PartnerDto>[] = [
        {field: 'partnerName', headerName: 'Партнер', flex: 1.5},
        {
            field: 'totalQuantity',
            headerName: 'Кол-во',
            width: 100,
            type: 'number'
        },
        {
            field: 'totalAmount',
            headerName: 'Оборот',
            width: 160,
            type: 'number',
            renderCell: (p) => <span style={{fontWeight: 'bold'}}>{formatCurrency(p.value)}</span>
        },
        {
            field: 'shareInGrandTotal',
            headerName: 'Доля (%)',
            width: 120,
            valueFormatter: (value: number) => `${value ? value.toFixed(1) : 0}%`,
            renderCell: (p) => (
                <Box sx={{width: '100%', display: 'flex', alignItems: 'center'}}>
                    <Box sx={{width: '100%', mr: 1}}>
                        <LinearProgress variant="determinate" value={Number(p.value)} color="primary"/>
                    </Box>
                    <Box sx={{minWidth: 35}}>
                        <Typography variant="body2"
                                    color="text.secondary">{`${Number(p.value).toFixed(1)}%`}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 50,
            sortable: false,
            renderCell: (params) => (
                <IconButton onClick={() => setSelectedPartner(params.row)} size="small">
                    <VisibilityIcon fontSize="small"/>
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            <Paper sx={{p: 2, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{xs: 12, md: 4}}>
                        <ToggleButtonGroup
                            color="primary"
                            value={reportType}
                            exclusive
                            onChange={(_, val) => val && setReportType(val)}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value="DEALER">Продажи (Дилеры)</ToggleButton>
                            <ToggleButton value="SUPPLIER">Закупки (Поставщики)</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>

                    <Grid size={{xs: 12, md: 8}}>
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <ButtonGroup variant="outlined" size="small" disabled={isLoading}>
                                <Button
                                    onClick={() => handleQuickFilter('today')}
                                    variant={dateFrom === format(new Date(), 'yyyy-MM-dd') && dateTo === format(new Date(), 'yyyy-MM-dd') ? 'contained' : 'outlined'}
                                >
                                    Сегодня
                                </Button>
                                <Button onClick={() => handleQuickFilter('yesterday')}>Вчера</Button>
                                <Button onClick={() => handleQuickFilter('week')}>Неделя</Button>
                                <Button onClick={() => handleQuickFilter('month')}>Месяц</Button>
                            </ButtonGroup>
                            <TextField label="С" type="date" size="small" value={dateFrom}
                                       onChange={e => setDateFrom(e.target.value)} InputLabelProps={{shrink: true}}
                                       sx={{width: 130}}/>
                            <TextField label="По" type="date" size="small" value={dateTo}
                                       onChange={e => setDateTo(e.target.value)} InputLabelProps={{shrink: true}}
                                       sx={{width: 130}}/>
                            <Button variant="contained" onClick={() => refetch()} disabled={!reportType || isLoading}
                                    size="small">
                                <RefreshIcon/>
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {!reportType ? (
                <Alert severity="info" variant="outlined">Выберите тип отчета.</Alert>
            ) : isLoading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', p: 5}}><CircularProgress/></Box>
            ) : isError ? (
                <Alert severity="error">Ошибка загрузки: {(error as Error).message}</Alert>
            ) : (
                <Grid container spacing={3}>
                    <Grid size={{xs: 12, md: 4}} sx={{minWidth: 0}}>
                        <Paper sx={{p: 2, height: '100%', minHeight: 400}}>
                            <Typography variant="h6" gutterBottom>
                                Структура {reportType === 'DEALER' ? 'Продаж' : 'Закупок'}
                            </Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                                {formatCurrency(data?.grandTotalAmount)}
                            </Typography>
                            <Box sx={{ position: 'relative', width: '100%', height: 300, mt: 2 }}>
                                {/* Внутренний контейнер прибит к краям, игнорируя flex-глюки */}
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => value != null ? formatCurrency(Number(value)) : '-'} />
                                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                                            Нет данных для графика
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{xs: 12, md: 8}}>
                        <Paper sx={{height: '100%', minHeight: 400}}>
                            <DataGrid
                                rows={data?.partners || []}
                                columns={columns}
                                getRowId={(row) => row.partnerId}
                                disableRowSelectionOnClick
                                sx={{border: 'none'}}
                                hideFooter={(data?.partners?.length ?? 0) < 100}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Dialog
                open={!!selectedPartner}
                onClose={() => setSelectedPartner(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 1.5, m: 1}
                }}
            >
                <DialogTitle
                    sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5}}>
                    <Typography variant="h6" component="span" sx={{fontSize: '1rem', fontWeight: 'bold'}}>
                        {selectedPartner?.partnerName || 'Детали'}
                    </Typography>
                    <IconButton onClick={() => setSelectedPartner(null)} size="small">
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{p: 1, maxHeight: '70vh'}}>
                    {selectedPartner && <PartnerProductTable partner={selectedPartner}/>}
                </DialogContent>
            </Dialog>
        </Box>
    );
};