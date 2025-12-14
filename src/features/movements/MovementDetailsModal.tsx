import {
    Box,
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
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type {MovementHistoryItem} from './types';
import {formatCurrency} from "../../lib/formatCurrency.ts";

interface MovementDetailsModalProps {
    movement: MovementHistoryItem | null;
    onClose: () => void;
}


export const MovementDetailsModal = ({movement, onClose}: MovementDetailsModalProps) => {


    if (!movement) {
        return null;
    }

    return (
        <Dialog open={!!movement} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                Детализация операции #{movement.id}
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{mt: 2}}>
                    <Typography><strong>Тип:</strong> {movement.movementType}</Typography>
                    <Typography><strong>Склад:</strong> {movement.warehouseName}</Typography>
                    <Typography><strong>Дата:</strong> {new Date(movement.movementTime).toLocaleString()}</Typography>
                    {movement.comment && <Typography><strong>Комментарий:</strong> {movement.comment}</Typography>}

                    <Typography variant="h6" sx={{mt: 3, mb: 1}}>Состав операции</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Наименование</TableCell>
                                    {movement.movementType === 'INBOUND' &&
                                        <TableCell align="right">Себестоимость</TableCell>}
                                    <TableCell align="right">Количество</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {movement.items.map((item) => (
                                    <TableRow key={item.productId}>
                                        <TableCell>{item.productName}</TableCell>
                                        {movement.movementType === 'INBOUND' && (
                                            <TableCell align="right">{formatCurrency(item.costPrice) ?? '—'}</TableCell>
                                        )}
                                        <TableCell align="right">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </DialogContent>
        </Dialog>
    );
};