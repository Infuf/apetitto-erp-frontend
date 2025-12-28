import {Box, Card, CardContent, CardHeader, Divider, Grid, Typography} from '@mui/material';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {formatCurrency} from '../../../../lib/formatCurrency.ts';
import type {ExpenseReportDto, IncomeReportDto} from '../../../finance/types.ts';

interface FinanceChartsProps {
    incomeData: IncomeReportDto | undefined;
    expenseData: ExpenseReportDto | undefined;
    isLoading: boolean;
}

interface ChartDataItem {
    name: string;
    value: number;
    percentage: number;
    subcategories: {
        subCategoryName: string;
        amount: number;
    }[];

    [key: string]: unknown;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        payload: ChartDataItem;
    }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

const CustomTooltip = ({active, payload}: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;

        return (
            <Box
                sx={{bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: 2, boxShadow: 3, minWidth: 200}}>
                <Typography variant="subtitle2" sx={{fontWeight: 'bold', color: 'primary.main'}}>
                    {data.name}
                </Typography>
                <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                    {formatCurrency(data.value)}
                    <Typography component="span" variant="caption" sx={{ml: 1, color: 'text.secondary'}}>
                        ({data.percentage}%)
                    </Typography>
                </Typography>

                {data.subcategories && data.subcategories.length > 0 && (
                    <Box sx={{mt: 1.5}}>
                        <Divider sx={{mb: 1}}/>
                        {/* TypeScript знает тип sub, так как он описан в ChartDataItem */}
                        {data.subcategories.map((sub, index) => (
                            <Box key={index} sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                                <Typography variant="caption" color="text.primary">
                                    {sub.subCategoryName}
                                </Typography>
                                <Typography variant="caption" fontWeight="medium">
                                    {formatCurrency(sub.amount)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        );
    }
    return null;
};

export const FinanceCharts = ({incomeData, expenseData, isLoading}: FinanceChartsProps) => {

    const incomeChartData: ChartDataItem[] = incomeData?.categories.map(c => ({
        name: c.categoryName,
        value: c.amount,
        percentage: c.percentage,
        subcategories: c.subcategories
    })) || [];

    const expenseChartData: ChartDataItem[] = expenseData?.categories.map(c => ({
        name: c.categoryName,
        value: c.amount,
        percentage: c.percentage,
        subcategories: c.subcategories
    })) || [];
    const renderChart = (title: string, data: ChartDataItem[], total: number) => (
        <Card variant="outlined" sx={{height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column'}}>
            <CardHeader
                title={title}
                subheader={`Всего: ${formatCurrency(total)}`}
                titleTypographyProps={{fontWeight: 'bold'}}
            />
            <CardContent sx={{flexGrow: 1, minHeight: 320}}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="99%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <Box sx={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Typography color="text.secondary">Нет данных за этот период</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    if (isLoading) return null;

    return (
        <Grid container spacing={3}>
            <Grid size={{xs: 12, md: 6}}>
                {renderChart("Структура Доходов", incomeChartData, incomeData?.totalIncome || 0)}
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                {renderChart("Структура Расходов", expenseChartData, expenseData?.totalExpense || 0)}
            </Grid>
        </Grid>
    );
};