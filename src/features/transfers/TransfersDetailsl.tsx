import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Paper, Button, Chip,
    List, ListItem, ListItemText, Divider, AppBar, Toolbar, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useTransfers } from './hooks/useTransfers';
import { formatAppDate } from '../../lib/formatDate';
import {Fragment} from "react";

export const TransferDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { useTransferDetails, receive } = useTransfers();

    const { data: transfer, isLoading, isError, error } = useTransferDetails(Number(id));

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) return <Alert severity="error">{(error as Error).message}</Alert>;
    if (!transfer) return <Alert severity="info">Перемещение не найдено.</Alert>;

    const statusInfo: Record<string, { label: string; color: any }> = {
        PENDING: { label: 'Ожидает отправки', color: 'default' },
        SHIPPED: { label: 'В пути', color: 'info' },
        RECEIVED: { label: 'Принят', color: 'success' },
        CANCELLED: { label: 'Отменен', color: 'error' },
    };

    const info = statusInfo[transfer.status] || { label: transfer.status, color: 'default' };

    return (
        <Box sx={{ pb: 10 }}>
            <AppBar position="sticky" color="default" elevation={1}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/transfers')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">
                        Перемещение #{transfer.id}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Информация</Typography>

                    <Chip label={info.label} color={info.color} sx={{ mb: 2 }} />

                    <Typography variant="body2"><strong>Дата:</strong> {formatAppDate(transfer.createdAt)}</Typography>
                    <Typography variant="body2"><strong>Откуда:</strong> {transfer.sourceWarehouseName}</Typography>
                    <Typography variant="body2"><strong>Куда:</strong> {transfer.destinationWarehouseName}</Typography>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Состав ({transfer.items.length})
                    </Typography>

                    <List disablePadding>
                        {transfer.items.map((item, index) => (
                            <Fragment key={item.productId}>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText
                                        primary={item.productName} // ← Название уже тут!
                                        secondary={`Кол-во: ${item.quantity}`}
                                    />
                                </ListItem>
                                {index < transfer.items.length - 1 && <Divider />}
                            </Fragment>
                        ))}
                    </List>
                </Paper>
            </Box>

            {transfer.status === 'SHIPPED' && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        borderTop: '1px solid #ddd',
                        bgcolor: 'background.paper'
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
