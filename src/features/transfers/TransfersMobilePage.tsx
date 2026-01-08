import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

import {useTransfers} from './hooks/useTransfers';
import {formatAppDate} from '../../lib/formatDate';
import type {TransferOrder} from './types';

const statusInfo: Record<TransferOrder['status'], {
    label: string;
    color: 'default' | 'info' | 'success' | 'error' | 'warning'
}> = {
    PENDING: {label: 'Ожидает', color: 'warning'}, // Желтый привлекает внимание
    SHIPPED: { label: 'В пути', color: 'info' },
    RECEIVED: { label: 'Принят', color: 'success' },
    CANCELLED: {label: 'Отмена', color: 'error'},
};

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount);

export const TransfersMobilePage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const {useInfiniteTransfers} = useTransfers();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
    } = useInfiniteTransfers();

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', pt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{m: 2}}>{(error as Error).message}</Alert>;
    }

    const transfers = data?.pages.flatMap(page => page.content) ?? [];

    return (
        <Box sx={{pb: 4, bgcolor: 'background.default', minHeight: '100vh'}}>
            {/* Заголовок как в нативных приложениях (Sticky header можно добавить потом) */}
            <Box sx={{px: 2, py: 2, bgcolor: 'background.paper', mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                <Typography variant="h5" component="h1" fontWeight="bold">
                    Перемещения
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Всего документов: {transfers.length}
                </Typography>
            </Box>

            {transfers.length === 0 && !isFetching && (
                <Box sx={{p: 4, textAlign: 'center'}}>
                    <Typography color="text.secondary">Нет перемещений</Typography>
                </Box>
            )}

            <Stack spacing={2} sx={{px: 2}}>
                {transfers.map((transfer) => {
                    // Рассчитываем итоговые цифры "на лету"
                    // ВАЖНО: Это сработает, если список возвращает items.
                    // Если items в списке нет (null), будет 0.
                    const totalItems = transfer.items?.length || 0;
                    const totalSum = transfer.items?.reduce((sum, item) => sum + ((item.sellingPrice || 0) * item.quantity), 0) || 0;

                    return (
                        <Card
                            key={transfer.id}
                            elevation={0}
                            sx={{
                                borderRadius: 3, // Более скругленные углы (iOS style)
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'hidden'
                            }}
                        >
                            <CardActionArea onClick={() => navigate(`/transfers/${transfer.id}`)}>
                                <CardContent sx={{p: 2}}>
                                    {/* Верхняя строка: Номер и Статус */}
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                                                #{transfer.id}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                • {formatAppDate(transfer.createdAt, 'dd.MM')}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={statusInfo[transfer.status].label}
                                            color={statusInfo[transfer.status].color}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </Box>

                                    {/* Маршрут: Откуда -> Куда */}
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                                        <Box sx={{flex: 1, minWidth: 0}}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {transfer.sourceWarehouseName}
                                            </Typography>
                                            <Box sx={{display: 'flex', justifyContent: 'center', my: 0.5}}>
                                                <ArrowForwardIcon sx={{
                                                    color: 'text.disabled',
                                                    fontSize: 16,
                                                    transform: 'rotate(90deg)'
                                                }}/>
                                                {/* На мобилке часто делают вертикально, но горизонтально тоже ок.
                                                    Если названия длинные, лучше ArrowForwardIcon color="action" fontSize="small"
                                                 */}
                                            </Box>
                                            <Typography variant="body1" fontWeight="600" noWrap>
                                                {transfer.destinationWarehouseName}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{my: 1.5, borderStyle: 'dashed'}}/>

                                    {/* Нижняя строка: Мета-данные (Товары и Деньги) */}
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            color: 'text.secondary'
                                        }}>
                                            <Inventory2OutlinedIcon fontSize="small" sx={{fontSize: 18}}/>
                                            <Typography variant="body2" fontWeight="medium">
                                                {totalItems} поз.
                                            </Typography>
                                        </Box>

                                        {totalSum > 0 && (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                color: theme.palette.success.main
                                            }}>
                                                <MonetizationOnOutlinedIcon fontSize="small" sx={{fontSize: 18}}/>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {formatMoney(totalSum)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    );
                })}
            </Stack>

            {hasNextPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="text"
                        size="large"
                        sx={{borderRadius: 4, px: 4}}
                    >
                        {isFetchingNextPage ? <CircularProgress size={24}/> : 'Показать еще'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};