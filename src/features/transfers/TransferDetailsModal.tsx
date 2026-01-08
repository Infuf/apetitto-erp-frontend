import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import {useTransfers} from './hooks/useTransfers';
import {formatAppDate} from '../../lib/formatDate';
import {formatCurrency} from "../../lib/formatCurrency.ts";

interface TransferDetailsModalProps {
    transferId: number | null;
    onClose: () => void;
}


export const TransferDetailsModal = ({transferId, onClose}: TransferDetailsModalProps) => {
    const {useTransferDetails} = useTransfers();
    const {data: transfer, isLoading, isError, error} = useTransferDetails(transferId);

    const totalSum = transfer?.items.reduce((sum, item) => {
        const price = item.sellingPrice || 0;
        return sum + (price * item.quantity);
    }, 0) || 0;

    return (
        <Dialog open={!!transferId} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                Детализация перемещения #{transferId}
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {(isLoading) && <CircularProgress/>}
                {isError && <Alert severity="error">{(error as Error).message}</Alert>}
                {transfer && (
                    <Box sx={{mt: 2}}>
                        <Typography variant="h6">Общая информация</Typography>
                        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 3}}>
                            <Typography component="span"><strong>Статус:</strong> <Chip label={transfer.status} size="small"/></Typography>
                            <Typography><strong>Дата создания:</strong> {formatAppDate(transfer.createdAt)}</Typography>
                            <Typography><strong>Откуда:</strong> {transfer.sourceWarehouseName}</Typography>
                            <Typography><strong>Куда:</strong> {transfer.destinationWarehouseName}</Typography>
                            {transfer.shippedAt &&
                                <Typography><strong>Дата отправки:</strong> {formatAppDate(transfer.shippedAt)}
                                </Typography>}
                            {transfer.receivedAt &&
                                <Typography><strong>Дата приемки:</strong> {formatAppDate(transfer.receivedAt)}
                                </Typography>}
                        </Box>

                        <Typography variant="h6" sx={{mt: 3, mb: 1}}>Состав перемещения</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Наименование</TableCell>
                                        <TableCell align="right">Количество</TableCell>
                                        <TableCell align="right">Цена</TableCell>
                                        <TableCell align="right">Сумма</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transfer.items.map((item) => (
                                        <TableRow key={item.productId}>
                                            <TableCell>{item.productName}</TableCell>

                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(item.sellingPrice)}
                                            </TableCell>


                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency((item.sellingPrice || 0) * item.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            ИТОГО:
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {formatCurrency(totalSum)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};