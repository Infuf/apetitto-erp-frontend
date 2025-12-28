import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Typography
} from '@mui/material';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {useState} from 'react';
import {formatCurrency} from '../../../../lib/formatCurrency';
import type {ExpenseReportDto, IncomeReportDto} from '../../../finance/types';

interface FinanceChartsProps {
    incomeData: IncomeReportDto | undefined;
    expenseData: ExpenseReportDto | undefined;
    isLoading: boolean;
}

interface SubCategory {
    subCategoryName: string;
    amount: number;
}

interface CategoryDto {
    categoryName: string;
    amount: number;
    percentage: number;
    subcategories: SubCategory[];
}

interface ChartDataItem {
    name: string;
    value: number;
    percentage: number;
    subcategories: SubCategory[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        payload: ChartDataItem;
    }[];
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#FF6666', '#66FF66', '#66CCFF'
];

/* ---------------- utils ---------------- */
const prepareTopData = (data: ChartDataItem[], limit = 10): ChartDataItem[] => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, limit);
    const rest = sorted.slice(limit);
    if (!rest.length) return top;

    return [
        ...top,
        {
            name: 'Остальное',
            value: rest.reduce((s, c) => s + c.value, 0),
            percentage: rest.reduce((s, c) => s + c.percentage, 0),
            subcategories: rest.flatMap(c => c.subcategories.map(sub => ({
                subCategoryName: `${c.name} · ${sub.subCategoryName}`,
                amount: sub.amount
            })))
        }
    ];
};

/* ---------------- tooltip ---------------- */
const CustomTooltip = ({active, payload}: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
        <Box sx={{bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: 2, boxShadow: 3, minWidth: 200}}>
            <Typography variant="subtitle2" fontWeight="bold">{data.name}</Typography>
            <Typography variant="h6" fontWeight="bold">
                {formatCurrency(data.value)}
                <Typography component="span" variant="caption" sx={{ml: 1, color: 'text.secondary'}}>
                    ({data.percentage}%)
                </Typography>
            </Typography>
            {!!data.subcategories?.length && (
                <Box sx={{mt: 1.5}}>
                    <Divider sx={{mb: 1}}/>
                    {data.subcategories.map((sub, i) => (
                        <Box key={i} sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                            <Typography variant="caption">{sub.subCategoryName}</Typography>
                            <Typography variant="caption" fontWeight="medium">{formatCurrency(sub.amount)}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

/* ---------------- main ---------------- */
export const FinanceCharts = ({incomeData, expenseData, isLoading}: FinanceChartsProps) => {
    const [selectedCategory, setSelectedCategory] = useState<ChartDataItem | null>(null);
    if (isLoading) return null;

    const mapData = (categories: CategoryDto[] = []) => prepareTopData(
        categories.map(c => ({
            name: c.categoryName,
            value: c.amount,
            percentage: c.percentage,
            subcategories: c.subcategories
        }))
    );

    const renderChart = (title: string, data: ChartDataItem[], total: number) => (
        <Card variant="outlined" sx={{height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column'}}>
            <CardHeader title={title}
                        subheader={`Всего: ${formatCurrency(total)}`} titleTypographyProps={{fontWeight: 'bold'}}
                        subheaderTypographyProps={{fontSize: '1.3rem', fontWeight: 'medium', color: 'text.primary'}}/>
            <CardContent sx={{flexGrow: 1, minHeight: 320, display: 'flex', gap: 3, flexWrap: 'wrap'}}>
                {data.length ? (
                    <>
                        <ResponsiveContainer width={300} height={300}>
                            <PieChart>
                                <Pie data={data.map(d => ({name: d.name, value: d.value}))} dataKey="value"
                                     innerRadius={60} outerRadius={90} paddingAngle={5}
                                     onClick={(_, i) => setSelectedCategory(data[i])} style={{cursor: 'pointer'}}>
                                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                                </Pie>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Список топ-10 рядом с цветами */}
                        <Box sx={{flexGrow: 1}}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 1}}>Топ 10 категорий</Typography>
                            {data.map((d, i) => (
                                <Box key={i} sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 0.5,
                                    borderBottom: '1px solid #ccc',
                                    pb: 0.5
                                }}>
                                    <Typography variant="body2" sx={{color: '#000', fontWeight: 'bold'}}>
                                        {d.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{fontWeight: 'bold', color: '#000'}}>
                                        {formatCurrency(d.value)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </>
                ) : (
                    <Box sx={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Typography color="text.secondary">Нет данных за период</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return <>
        <Grid container spacing={3}>
            <Grid size={{xs: 12, md: 6}}>
                {renderChart('Структура доходов', mapData(incomeData?.categories), incomeData?.totalIncome || 0)}
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                {renderChart('Структура расходов', mapData(expenseData?.categories), expenseData?.totalExpense || 0)}
            </Grid>
        </Grid>

        {/* Drill-down */}
        <Dialog open={!!selectedCategory} onClose={() => setSelectedCategory(null)} maxWidth="sm" fullWidth>
            <DialogTitle>{selectedCategory?.name}</DialogTitle>
            <DialogContent>
                {selectedCategory?.subcategories?.length ? (
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Подкатегории</Typography>
                        {selectedCategory.subcategories.map((sub, i) => (
                            <Box key={i} sx={{display: 'flex', justifyContent: 'space-between', mt: 0.5, mb: 0.5}}>
                                <Typography variant="caption">{sub.subCategoryName}</Typography>
                                <Typography variant="caption"
                                            fontWeight="medium">{formatCurrency(sub.amount)}</Typography>
                            </Box>
                        ))}
                    </Box>
                ) : <Typography color="text.secondary">Детализация отсутствует</Typography>}
            </DialogContent>
        </Dialog>
    </>;
};
