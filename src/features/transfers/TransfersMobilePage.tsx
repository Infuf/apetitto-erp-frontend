import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardActionArea, CardContent, Chip, Button } from '@mui/material';
import { useTransfers } from './hooks/useTransfers';
import { formatAppDate } from '../../lib/formatDate';
import type { TransferOrder } from './types';

const statusInfo: Record<TransferOrder['status'], { label: string; color: 'default' | 'info' | 'success' | 'error' }> = {
    PENDING: { label: 'Ожидает отправки', color: 'default' },
    SHIPPED: { label: 'В пути', color: 'info' },
    RECEIVED: { label: 'Принят', color: 'success' },
    CANCELLED: { label: 'Отменен', color: 'error' },
};

export const TransfersMobilePage = () => {
    const navigate = useNavigate();
    const { useInfiniteTransfers, } = useTransfers();

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
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{(error as Error).message}</Alert>;
    }

    const transfers = data?.pages.flatMap(page => page.content) ?? [];

    return (
        <Box sx={{ pb: 8 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                Перемещения
            </Typography>

            {transfers.length === 0 && !isFetching && (
                <Typography color="text.secondary">Нет доступных перемещений.</Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {transfers.map((transfer) => (
                    <Card key={transfer.id} variant="outlined">
                        <CardActionArea onClick={() => navigate(`/transfers/${transfer.id}`)}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" component="div">
                                        #{transfer.id} от {formatAppDate(transfer.createdAt, 'dd.MM.yyyy')}
                                    </Typography>
                                    <Chip
                                        label={statusInfo[transfer.status].label}
                                        color={statusInfo[transfer.status].color}
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {transfer.sourceWarehouseName} → <strong>{transfer.destinationWarehouseName}</strong>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>

            {hasNextPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};