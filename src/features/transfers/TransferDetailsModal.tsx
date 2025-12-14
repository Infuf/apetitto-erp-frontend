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
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import {useTransfers} from './hooks/useTransfers';
import {formatAppDate} from '../../lib/formatDate';

interface TransferDetailsModalProps {
    transferId: number | null;
    onClose: () => void;
}


export const TransferDetailsModal = ({transferId, onClose}: TransferDetailsModalProps) => {
    const {useTransferDetails} = useTransfers();
    const {data: transfer, isLoading, isError, error} = useTransferDetails(transferId);

    return (
        <Dialog open={!!transferId} onClose={onClose} maxWidth="md" fullWidth>
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

                        <Typography variant="h6" sx={{mt: 3, mb: 1}}>Состав перемещения</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {/*<TableCell>Артикул</TableCell>*/}
                                        <TableCell>Наименование</TableCell>
                                        <TableCell align="right">Количество</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transfer.items.map((item) => (
                                        <TableRow key={item.productId}>
                                            {/*<TableCell>{item.productCode}</TableCell>*/}
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};