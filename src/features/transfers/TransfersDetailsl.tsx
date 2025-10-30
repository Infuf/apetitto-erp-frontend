import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Paper, Button, Chip,
    List, ListItem, ListItemText, Divider, AppBar, Toolbar, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useTransfers } from './hooks/useTransfers';
import { formatAppDate } from '../../lib/formatDate';
import type { Product } from '../product/types';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { Fragment } from "react/jsx-runtime";

const fetchAllProducts = async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get('/products', { params: { size: 2000 } });
    return data.content;
};

const statusInfo: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'error' }> = {
    PENDING: { label: 'Ожидает отправки', color: 'default' },
    SHIPPED: { label: 'В пути', color: 'info' },
    RECEIVED: { label: 'Принят', color: 'success' },
    CANCELLED: { label: 'Отменен', color: 'error' },
};

export const TransferDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { useTransferDetails, receive } = useTransfers();

    const { data: transfer, isLoading, isError, error } = useTransferDetails(Number(id));

    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['allProducts'],
        queryFn: fetchAllProducts,
        staleTime: 1000 * 60 * 10,
    });

    const productsMap = new Map(products?.map(p => [p.id, p]));

    if (isLoading || isLoadingProducts) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) return <Alert severity="error">{(error as Error).message}</Alert>;
    if (!transfer) return <Alert severity="info">Перемещение не найдено.</Alert>;

    const info = statusInfo[transfer.status] || { label: transfer.status, color: 'default' };

    return (
        <Box sx={{ pb: 12 }}> {/* Оставляем место внизу для "плавающей" кнопки */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/transfers')} aria-label="back">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div">
                        Перемещение #{transfer.id}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Детали</Typography>
                    <Chip label={info.label} color={info.color} sx={{ mb: 2 }} />
                    <Typography variant="body2"><strong>Дата:</strong> {formatAppDate(transfer.createdAt)}</Typography>
                    <Typography variant="body2"><strong>Откуда:</strong> {transfer.sourceWarehouseName}</Typography>
                    <Typography variant="body2"><strong>Куда:</strong> {transfer.destinationWarehouseName}</Typography>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Состав ({transfer.items.length} поз.)</Typography>
                    <List disablePadding>
                        {transfer.items.map((item, index) => {
                            const product = productsMap.get(item.productId);
                            return (
                                <Fragment key={item.productId}>
                                    <ListItem disableGutters>
                                        <ListItemText
                                            primary={product?.name || 'Загрузка...'}
                                            secondary={`Арт: ${product?.productCode || 'N/A'} | Кол-во: ${item.quantity}`}
                                        />
                                    </ListItem>
                                    {index < transfer.items.length - 1 && <Divider component="li" />}
                                </Fragment>
                            );
                        })}
                    </List>
                </Paper>
            </Box>

            {/* --- ПЛАВАЮЩАЯ ПАНЕЛЬ ДЕЙСТВИЙ --- */}
            {transfer.status === 'SHIPPED' && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        borderTop: '1px solid #e0e0e0'
                    }}
                >
                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        size="large"
                        onClick={() => receive.mutate(transfer.id)}
                        disabled={receive.isPending}
                    >
                        {receive.isPending ? <CircularProgress size={26} color="inherit" /> : 'Принять поставку'}
                    </Button>
                </Paper>
            )}
        </Box>
    );
};