import {useNavigate, useParams} from 'react-router-dom';
import {Fragment, useMemo} from "react";
import {
    Alert,
    AppBar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import {useTransfers} from './hooks/useTransfers';
import {formatAppDate} from '../../lib/formatDate';

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount);

export const TransferDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { useTransferDetails, receive } = useTransfers();

    const { data: transfer, isLoading, isError, error } = useTransferDetails(Number(id));

    const totalSum = useMemo(() => {
        if (!transfer?.items) return 0;
        return transfer.items.reduce((acc, item) => acc + ((item.sellingPrice || 0) * item.quantity), 0);
    }, [transfer]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) return <Alert severity="error" sx={{m: 2}}>{(error as Error).message}</Alert>;
    if (!transfer) return <Alert severity="info" sx={{m: 2}}>Перемещение не найдено.</Alert>;

    const statusInfo: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'error' | 'warning' }> = {
        PENDING: {label: 'Ожидает отправки', color: 'warning'},
        SHIPPED: { label: 'В пути', color: 'info' },
        RECEIVED: { label: 'Принят', color: 'success' },
        CANCELLED: { label: 'Отменен', color: 'error' },
    };

    const info = statusInfo[transfer.status] || { label: transfer.status, color: 'default' };

    return (
        <Box sx={{pb: 12, bgcolor: 'background.default', minHeight: '100vh'}}>
            <AppBar position="sticky" color="inherit" elevation={0}
                    sx={{borderBottom: '1px solid', borderColor: 'divider'}}>
                <Toolbar sx={{pr: 1}}>
                    <IconButton edge="start" onClick={() => navigate(-1)} sx={{mr: 0.5}}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            mr: 1,
                            minWidth: 0,
                            fontSize: { xs: '1.1rem', sm: '1.25rem'}
                        }}>
                        Перемещение #{transfer.id}
                    </Typography>
                    <Chip
                        label={info.label}
                        color={info.color}
                        size="small"
                        sx={{fontWeight: 'bold', borderRadius: '6px'}}
                    />
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2 }}>
                <Paper elevation={0} sx={{p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Общая сумма</Typography>
                            <Typography variant="h5" color="success.main" fontWeight="bold">
                                {formatMoney(totalSum)}
                                <Typography component="span" variant="body2" color="text.secondary"
                                            sx={{ml: 0.5}}>сум</Typography>
                            </Typography>
                        </Box>
                        <ReceiptLongIcon sx={{color: 'text.secondary', opacity: 0.5, fontSize: 32}}/>
                    </Stack>

                    <Divider sx={{mb: 2, borderStyle: 'dashed'}}/>

                    <Stack spacing={1.5}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                            <CalendarTodayIcon fontSize="small" color="action"/>
                            <Typography variant="body2">
                                {formatAppDate(transfer.createdAt)}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            mt: 1,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 2
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <StorefrontIcon fontSize="small" color="action"/>
                                <Typography variant="body2" fontWeight="500">{transfer.sourceWarehouseName}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, pl: 0.5}}>
                                <ArrowForwardIcon
                                    sx={{transform: 'rotate(90deg)', color: 'text.disabled', fontSize: 16}}/>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <StorefrontIcon fontSize="small"
                                                color="action"/> {/* Можно заменить на иконку получателя */}
                                <Typography variant="body2"
                                            fontWeight="500">{transfer.destinationWarehouseName}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>

                <Typography variant="h6" sx={{mb: 1.5, px: 1, fontWeight: 600}}>
                    Товары ({transfer.items.length})
                </Typography>

                <Paper elevation={0}
                       sx={{borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden'}}>
                    {transfer.items.map((item, index) => {
                        const lineTotal = (item.sellingPrice || 0) * item.quantity;

                        return (
                            <Fragment key={item.productId}>
                                <Box sx={{p: 2}}>
                                    <Typography variant="subtitle1" fontWeight="600" sx={{mb: 0.5, lineHeight: 1.2}}>
                                        {item.productName}
                                    </Typography>

                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Артикул: {item.productCode || '-'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatMoney(item.sellingPrice || 0)} сум/шт.
                                            </Typography>
                                        </Box>

                                        <Box sx={{textAlign: 'right'}}>
                                            <Chip
                                                label={`${item.quantity} шт.`}
                                                size="small"
                                                sx={{mb: 0.5, fontWeight: 'bold', bgcolor: 'grey.100'}}
                                            />
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatMoney(lineTotal)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                {index < transfer.items.length - 1 && <Divider />}
                            </Fragment>
                        );
                    })}
                </Paper>
            </Box>

            {transfer.status === 'SHIPPED' && (
                <Paper
                    elevation={4}
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        pb: 3,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        bgcolor: 'background.paper',
                        zIndex: 10
                    }}
                >
                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        size="large"
                        startIcon={!receive.isPending && <LocalShippingIcon/>}
                        onClick={() => receive.mutate(transfer.id)}
                        disabled={receive.isPending}
                        sx={{
                            height: 48,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            borderRadius: 2
                        }}
                    >
                        {receive.isPending ? <CircularProgress size={26} color="inherit" /> : 'Принять поставку'}
                    </Button>
                </Paper>
            )}
        </Box>
    );
};