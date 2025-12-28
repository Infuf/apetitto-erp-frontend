import {Box, Grid, IconButton, Paper, Tooltip, Typography} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Деньги
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Нам должны
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // Мы должны
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Нетто
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {formatCurrency} from '../../../../lib/formatCurrency.ts';
import type {AccountSummary, CompanyFinancialStateDto} from '../../../finance/types.ts';

interface FinancialStateCardsProps {
    data: CompanyFinancialStateDto | undefined;
    isLoading: boolean;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'error' | 'info';
    details?: AccountSummary[];
    subLabel?: string;
}

const StatCard = ({title, value, icon, color, details, subLabel}: StatCardProps) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            height: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)',
                borderColor: `${color}.main`,
            }
        }}
    >
        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${color}.light`,
                    color: `${color}.main`,
                    display: 'flex',
                    mr: 2
                }}
            >
                {icon}
            </Box>
            <Box sx={{flexGrow: 1}}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {title}
                </Typography>
                <Typography variant="h5" fontWeight="800">
                    {formatCurrency(value)}
                </Typography>
            </Box>

            {/* Если есть детали (топ должников), показываем иконку с подсказкой */}
            {details && details.length > 0 && (
                <Tooltip
                    arrow
                    title={
                        <Box sx={{p: 1}}>
                            <Typography variant="subtitle2" sx={{mb: 1}}>{subLabel}:</Typography>
                            {details.map((item: AccountSummary) => (
                                <Box key={item.id}
                                     sx={{display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.5}}>
                                    <span>{item.name}</span>
                                    <b>{formatCurrency(item.amount)}</b>
                                </Box>
                            ))}
                        </Box>
                    }
                >
                    <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    </Paper>
);

export const FinancialStateCards = ({data, isLoading}: FinancialStateCardsProps) => {
    if (isLoading || !data) {
        return null;
    }

    return (
        <Grid container spacing={3}>
            {/* 1. Живые деньги (Кассы + Банки) */}
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatCard
                    title="Всего денег"
                    value={data.money.totalAmount}
                    icon={<AccountBalanceWalletIcon/>}
                    color="primary"
                    details={data.money.details}
                    subLabel="По счетам"
                />
            </Grid>

            {/* 2. Дебиторка (Нам должны) */}
            <Grid size={{xs: 12, sm: 6, md: 3}}>

                <StatCard
                    title="Нам должны (Дебиторка)"
                    value={data.receivables.totalAmount}
                    icon={<TrendingUpIcon/>}
                    color="success"
                    details={data.receivables.topDebtors}
                    subLabel="Топ должников"
                />
            </Grid>

            {/* 3. Кредиторка (Мы должны) */}
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatCard
                    title="Мы должны (Кредиторка)"
                    value={data.payables.totalAmount}
                    icon={<TrendingDownIcon/>}
                    color="error"
                    details={data.payables.topDebtors} // Предполагаем, что бэк вернет topCreditors в том же формате
                    subLabel="Топ кредиторов"
                />
            </Grid>

            {/* 4. Чистый баланс (Деньги + Долги нам - Наши долги) */}
            <Grid size={{xs: 12, sm: 6, md: 3}}>
                <StatCard
                    title="Чистый капитал"
                    value={data.netBalance}
                    icon={<AccountBalanceIcon/>}
                    color="info"
                />
            </Grid>
        </Grid>
    );
};