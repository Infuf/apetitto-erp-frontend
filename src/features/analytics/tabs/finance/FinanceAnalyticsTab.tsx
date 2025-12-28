import {useState} from 'react';
import {Box, Button, ButtonGroup, LinearProgress, TextField, Typography} from '@mui/material';
import {endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays} from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';

import {useFinanceAnalytics} from '../../../finance/hooks/useFinanceAnalytics.ts';
import {FinancialStateCards} from './FinancialStateCards.tsx';
import {FinanceCharts} from './FinanceCharts.tsx';

export const FinanceAnalyticsTab = () => {
    const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

    const isoDateFrom = new Date(dateFrom + 'T00:00:00').toISOString();
    const isoDateTo = new Date(dateTo + 'T23:59:59.999').toISOString();

    const { useCompanyState, useIncomeReport, useExpenseReport } = useFinanceAnalytics();

    const { data: companyState, isLoading: isStateLoading, refetch: refetchState } = useCompanyState();

    const {
        data: incomeReport,
        isLoading: isIncomeLoading,
        refetch: refetchIncome
    } = useIncomeReport(isoDateFrom, isoDateTo);

    const {
        data: expenseReport,
        isLoading: isExpenseLoading,
        refetch: refetchExpense
    } = useExpenseReport(isoDateFrom, isoDateTo);

    const handleRefresh = () => {
        refetchState();
        refetchIncome();
        refetchExpense();
    };

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
                // Неделя начинается с понедельника (weekStartsOn: 1)
                start = startOfWeek(now, { weekStartsOn: 1 });
                end = endOfWeek(now, { weekStartsOn: 1 });
                break;
            case 'month':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
        }

        setDateFrom(format(start, 'yyyy-MM-dd'));
        setDateTo(format(end, 'yyyy-MM-dd'));
    };

    const isLoading = isStateLoading || isIncomeLoading || isExpenseLoading;
    return (
        <Box>
            {/* Заголовок и фильтры */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Typography variant="h4" component="h1">
                    Аналитика Баксов
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    {/* Кнопки быстрых фильтров */}
                    <ButtonGroup variant="outlined" size="small" disabled={isLoading}>
                        <Button onClick={() => handleQuickFilter('today')}>Сегодня</Button>
                        <Button onClick={() => handleQuickFilter('yesterday')}>Вчера</Button>
                        <Button onClick={() => handleQuickFilter('week')}>Неделя</Button>
                        <Button onClick={() => handleQuickFilter('month')}>Месяц</Button>
                    </ButtonGroup>

                    {/* Выбор дат и кнопка обновления */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="С"
                            type="date"
                            size="small"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                            disabled={isLoading}
                        />
                        <TextField
                            label="По"
                            type="date"
                            size="small"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                            disabled={isLoading}
                        />
                        <Button
                            variant="contained" // Сделал кнопку заметнее
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            Обновить
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* 3. Индикатор загрузки (вместо того чтобы скрывать контент) */}
            <Box sx={{ height: 4, mb: 3 }}>
                {isLoading && <LinearProgress />}
            </Box>

            {/* Блок 1: Карточки состояния */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Текущее состояние
                </Typography>
                {/* Передаем isLoading, чтобы внутри можно было показать скелетоны, если нужно */}
                <FinancialStateCards data={companyState} isLoading={isStateLoading} />
            </Box>

            {/* Блок 2: Графики */}
            <Box>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Аналитика за период
                </Typography>
                <FinanceCharts
                    incomeData={incomeReport}
                    expenseData={expenseReport}
                    isLoading={isIncomeLoading || isExpenseLoading}
                />
            </Box>
        </Box>
    );
};