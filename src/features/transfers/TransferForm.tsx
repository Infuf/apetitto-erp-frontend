import {useEffect, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

import {axiosInstance} from '../../api/axiosInstance';
import type {Item as TransferItem, ProductOption, TransferOrderRequestDto, WarehouseOption} from './types';

interface TransferFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TransferOrderRequestDto) => void;
    isSubmitting: boolean;
}

const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const searchProducts = async (name: string): Promise<ProductOption[]> => {
    if (!name || name.length < 3) return [];
    const {data} = await axiosInstance.get('/products/search', {params: {name}});
    return data.content || [];
};

export const TransferForm = ({open, onClose, onSubmit, isSubmitting}: TransferFormProps) => {
    const LAST_SOURCE_WAREHOUSE_KEY = 'transfer:lastSourceWarehouseId';
    const [sourceWarehouseId, setSourceWarehouseId] = useState<number | null>(null);
    const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null);
    const [items, setItems] = useState<(TransferItem & {
        productName?: string;
        productCode?: string;
        productPrice?: number
    })[]>([]);

    const [productSearchInput, setProductSearchInput] = useState('');
    const [debouncedProductInput, setDebouncedProductInput] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [quantity, setQuantity] = useState<number | ''>(1);
    const [isAutoInbound, setIsAutoInbound] = useState<boolean>(true);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedProductInput(productSearchInput), 300);
        return () => clearTimeout(handler);
    }, [productSearchInput]);

    const {data: warehouses = [], isLoading: isLoadingWarehouses} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const {data: productOptions = [], isLoading: isLoadingProducts} = useQuery({
        queryKey: ['productSearch', debouncedProductInput],
        queryFn: () => searchProducts(debouncedProductInput),
        enabled: debouncedProductInput.length >= 3,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (open) {
            const savedId = localStorage.getItem(LAST_SOURCE_WAREHOUSE_KEY);
            if (savedId) setSourceWarehouseId(Number(savedId));
        } else {
            setDestinationWarehouseId(null);
            setItems([]);
            setSelectedProduct(null);
            setQuantity(1);
            setProductSearchInput('');
        }
    }, [open]);

    const handleAddItem = () => {
        if (!selectedProduct || !quantity || quantity <= 0) return;
        setItems(prev => {
            const existingItem = prev.find(item => item.productId === selectedProduct.id);
            if (existingItem) {
                alert('Этот товар уже добавлен.');
                return prev;
            }
            return [...prev, {
                productId: selectedProduct.id,
                quantity,
                productName: selectedProduct.name,
                productCode: selectedProduct.productCode,
            }];
        });
        setSelectedProduct(null);
        setQuantity(1);
        setProductSearchInput('');
    };

    const handleRemoveItem = (productId: number) => setItems(prev => prev.filter(item => item.productId !== productId));

    const handleSubmit = () => {
        if (!sourceWarehouseId || !destinationWarehouseId || sourceWarehouseId === destinationWarehouseId || items.length === 0) {
            alert('Пожалуйста, выберите склады (они не должны совпадать) и добавьте хотя бы один товар.');
            return;
        }
        const itemsToSubmit = items.map(item => ({productId: item.productId, quantity: item.quantity}));
        onSubmit({sourceWarehouseId, destinationWarehouseId, isAutoInbound, items: itemsToSubmit});
    };

    const isDestinationDisabled = !sourceWarehouseId;
    const destinationOptions = warehouses.filter(w => w.id !== sourceWarehouseId);

    return (
        <Dialog open={open} maxWidth="md" fullWidth disableEscapeKeyDown={isSubmitting}>
            <DialogTitle>Создание перемещения</DialogTitle>
            <DialogContent>
                <Typography variant="h6" gutterBottom sx={{mt: 2}}>1. Выберите склады</Typography>
                <Box sx={{display: 'flex', gap: 2, mb: 4}}>
                    <Autocomplete
                        options={warehouses}
                        getOptionLabel={(option) => option.name}
                        value={warehouses.find(w => w.id === sourceWarehouseId) || null}
                        onChange={(_, newValue) => {
                            const id = newValue?.id || null;
                            setSourceWarehouseId(id);
                            setDestinationWarehouseId(null);
                            if (id) localStorage.setItem(LAST_SOURCE_WAREHOUSE_KEY, String(id));
                        }}
                        loading={isLoadingWarehouses}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Склад-отправитель"/>}
                    />
                    <Autocomplete
                        options={destinationOptions}
                        getOptionLabel={(option) => option.name}
                        value={warehouses.find(w => w.id === destinationWarehouseId) || null}
                        onChange={(_, newValue) => setDestinationWarehouseId(newValue?.id || null)}
                        loading={isLoadingWarehouses}
                        disabled={isDestinationDisabled}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Склад-получатель"/>}
                    />
                </Box>
                <FormControlLabel
                    control={<Switch checked={isAutoInbound} onChange={(e) => setIsAutoInbound(e.target.checked)}/>}
                    label="Автоматически оприходовать товар на склад-отправитель"
                />
                <Typography variant="h6" gutterBottom>2. Добавьте товары</Typography>
                <Paper elevation={2} sx={{p: 2, display: 'flex', gap: 2, alignItems: 'center', mb: 2}}>
                    <Autocomplete
                        options={productOptions}
                        getOptionLabel={(option) => `${option.productCode} - ${option.name}`}
                        value={selectedProduct}
                        onChange={(_, newValue) => setSelectedProduct(newValue)}
                        inputValue={productSearchInput}
                        onInputChange={(_, newInputValue) => setProductSearchInput(newInputValue)}
                        loading={isLoadingProducts}
                        sx={{flexGrow: 1}}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Поиск товара"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isLoadingProducts ? <CircularProgress color="inherit" size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <TextField
                        label="Кол-во"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        sx={{width: 120}}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <IconButton color="primary" onClick={handleAddItem} disabled={!selectedProduct || !quantity}>
                        <AddCircleOutlineIcon/>
                    </IconButton>
                </Paper>

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Артикул</TableCell>
                                <TableCell>Наименование</TableCell>
                                <TableCell align="right">Количество</TableCell>
                                <TableCell align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.productId}>
                                    <TableCell>{item.productCode}</TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleRemoveItem(item.productId)}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Создать перемещение'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};