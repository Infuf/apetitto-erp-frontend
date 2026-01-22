import {useEffect, useMemo, useRef, useState} from 'react';
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
    TableFooter,
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

interface LocalTransferItem extends TransferItem {
    productName?: string;
    productCode?: string;
    price: number;
}

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
};

const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const searchProducts = async (name: string): Promise<ProductOption[]> => {
    if (!name || name.length < 3) return [];
    const {data} = await axiosInstance.get('/products/search', {
        params: {
            name,
            size: 20
        }
    });
    return data.content || [];
};

export const TransferForm = ({open, onClose, onSubmit, isSubmitting}: TransferFormProps) => {
    const LAST_SOURCE_WAREHOUSE_KEY = 'transfer:lastSourceWarehouseId';

    const searchInputRef = useRef<HTMLInputElement>(null);

    const [sourceWarehouseId, setSourceWarehouseId] = useState<number | null>(null);
    const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null);
    const [items, setItems] = useState<LocalTransferItem[]>([]);

    const [productSearchInput, setProductSearchInput] = useState('');
    const [debouncedProductInput, setDebouncedProductInput] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [quantity, setQuantity] = useState<number | ''>(1);
    const [isAutoInbound, setIsAutoInbound] = useState<boolean>(true);
    const AUTO_INBOUND_WAREHOUSE_NAME = 'TAYYOR MAXSULOTLAR OMBORI';

    const totalOrderSum = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedProductInput(productSearchInput), 300);
        return () => clearTimeout(handler);
    }, [productSearchInput]);

    const {data: warehouses = [], isLoading: isLoadingWarehouses} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });
    const sourceWarehouse = warehouses.find(w => w.id === sourceWarehouseId);
    const isAutoInboundAllowed =
        sourceWarehouse?.name === AUTO_INBOUND_WAREHOUSE_NAME

    useEffect(() => {
        if (isAutoInboundAllowed) {
            setIsAutoInbound(true);
        } else {
            setIsAutoInbound(false);
        }
    }, [isAutoInboundAllowed]);

    const {data: productOptions = [], isLoading: isLoadingProducts} = useQuery({
        queryKey: ['productSearch', debouncedProductInput],
        queryFn: () => searchProducts(debouncedProductInput),
        enabled: debouncedProductInput.length >= 3 && !selectedProduct,
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

        const productPrice = selectedProduct.sellingPrice || 0;

        setItems(prev => {
            const existingItem = prev.find(item => item.productId === selectedProduct.id);
            if (existingItem) {
                alert('Этот товар уже добавлен.');
                return prev;
            }
            return [...prev, {
                productId: selectedProduct.id,
                quantity: Number(quantity),
                productName: selectedProduct.name,
                productCode: selectedProduct.productCode,
                price: productPrice,
            }];
        });

        setSelectedProduct(null);
        setQuantity(1);
        setProductSearchInput('');

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };

    const handleRemoveItem = (productId: number) => setItems(prev => prev.filter(item => item.productId !== productId));

    const handleSubmit = () => {
        if (!sourceWarehouseId || !destinationWarehouseId || sourceWarehouseId === destinationWarehouseId || items.length === 0) {
            alert('Пожалуйста, выберите склады (они не должны совпадать) и добавьте хотя бы один товар.');
            return;
        }

        const itemsToSubmit = items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        onSubmit({
            sourceWarehouseId,
            destinationWarehouseId,
            isAutoInbound,
            items: itemsToSubmit
        });
    };

    const isDestinationDisabled = !sourceWarehouseId;
    const destinationOptions = warehouses.filter(w => w.id !== sourceWarehouseId);

    return (
        <Dialog open={open} maxWidth="lg" fullWidth disableEscapeKeyDown={isSubmitting}>
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

                {isAutoInboundAllowed && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isAutoInbound}
                                onChange={(e) => setIsAutoInbound(e.target.checked)}
                            />
                        }
                        label="Автоматически оприходовать товар на склад-отправитель"
                    />
                )}

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
                                inputRef={searchInputRef}
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
                                <TableCell align="right">Цена</TableCell>
                                <TableCell align="right">Сумма</TableCell>
                                <TableCell align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.productId}>
                                    <TableCell>{item.productCode}</TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                    <TableCell align="right">{formatMoney(item.price)}</TableCell>
                                    <TableCell align="right" sx={{fontWeight: 'bold'}}>
                                        {formatMoney(item.price * item.quantity)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleRemoveItem(item.productId)}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{py: 3, color: 'text.secondary'}}>
                                        Товары не добавлены
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {items.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} align="right" sx={{fontWeight: 'bold', fontSize: '1rem'}}>
                                        ИТОГО:
                                    </TableCell>
                                    <TableCell align="right" sx={{fontWeight: 'bold', fontSize: '1rem'}}>
                                        {formatMoney(totalOrderSum)}
                                    </TableCell>
                                    <TableCell/>
                                </TableRow>
                            </TableFooter>
                        )}
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