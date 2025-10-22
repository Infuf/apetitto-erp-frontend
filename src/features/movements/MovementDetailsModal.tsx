import {
    Box, Dialog, DialogContent, DialogTitle, IconButton, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { MovementHistoryItem } from './types';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import type { Product } from '../product/types';

interface MovementDetailsModalProps {
    movement: MovementHistoryItem | null;
    onClose: () => void;
}

const fetchAllProducts = async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get('/products', { params: { size: 1000 } });
    return data.content;
};

export const MovementDetailsModal = ({ movement, onClose }: MovementDetailsModalProps) => {
    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['allProducts'],
        queryFn: fetchAllProducts,
        staleTime: 1000 * 60 * 5,
    });

    const productsMap = new Map(products?.map(p => [p.id, p]));

    if (!movement) {
        return null;
    }

    return (
        <Dialog open={!!movement} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Детализация операции #{movement.id}
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mt: 2 }}>
                    <Typography><strong>Тип:</strong> {movement.movementType}</Typography>
                    <Typography><strong>Склад:</strong> {movement.warehouseName}</Typography>
                    <Typography><strong>Дата:</strong> {new Date(movement.movementTime).toLocaleString()}</Typography>
                    {movement.comment && <Typography><strong>Комментарий:</strong> {movement.comment}</Typography>}

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Состав операции</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Артикул</TableCell>
                                    <TableCell>Наименование</TableCell>
                                    {movement.movementType === 'INBOUND' && <TableCell align="right">Себестоимость</TableCell>}
                                    <TableCell align="right">Количество</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoadingProducts ? (
                                    <TableRow><TableCell colSpan={4}>Загрузка названий товаров...</TableCell></TableRow>
                                ) : (
                                    movement.items.map((item) => {
                                        const product = productsMap.get(item.productId);
                                        return (
                                            <TableRow key={item.productId}>
                                                <TableCell>{product?.productCode || `ID: ${item.productId}`}</TableCell>
                                                <TableCell>{product?.name || 'Не найдено'}</TableCell>
                                                {movement.movementType === 'INBOUND' && <TableCell align="right">{item.costPrice ?? '—'}</TableCell>}
                                                <TableCell align="right">{item.quantity}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </DialogContent>
        </Dialog>
    );
};