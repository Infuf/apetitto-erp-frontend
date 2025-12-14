import {useEffect, useMemo, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
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
    TextField,
    Typography
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import {NumericFormat} from "react-number-format";

import {axiosInstance} from '../../api/axiosInstance';
import {formatCurrency} from "../../lib/formatCurrency";
import {type FinanceAccount} from '../finance/types.ts'
import type {MovementItem, MovementType, ProductOption, StockMovementRequestDto, WarehouseOption} from './types';

interface MovementFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: StockMovementRequestDto) => void;
    isSubmitting: boolean;
    movementType: MovementType;
}


const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const {data} = await axiosInstance.get('/warehouses');
    return data;
};

const fetchAccounts = async (): Promise<FinanceAccount[]> => {
    const {data} = await axiosInstance.get('/finance/accounts');
    return data;
};

const searchProducts = async (name: string): Promise<ProductOption[]> => {
    if (!name) return [];
    const {data} = await axiosInstance.get('/products/search', {params: {name}});
    return data.content || [];
};


const formTitles: Record<MovementType, string> = {
    INBOUND: 'Новый приход',
    OUTBOUND: 'Новый расход / списание',
    ADJUSTMENT: 'Новая корректировка',
};

export const MovementForm = ({open, onClose, onSubmit, isSubmitting, movementType}: MovementFormProps) => {
    const [warehouseId, setWarehouseId] = useState<number | null>(null);
    const [accountId, setAccountId] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [items, setItems] = useState<MovementItem[]>([]);

    const [productSearchInput, setProductSearchInput] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [quantity, setQuantity] = useState<number | ''>(1);
    const [costPrice, setCostPrice] = useState<number | ''>('');


    const {data: warehouses = [], isLoading: isLoadingWarehouses} = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const {data: accounts = [], isLoading: isLoadingAccounts} = useQuery({
        queryKey: ['financeAccounts'],
        queryFn: fetchAccounts,
        enabled: open && movementType !== 'ADJUSTMENT',
    });

    const {data: productOptions = [], isLoading: isLoadingProducts} = useQuery({
        queryKey: ['productSearch', productSearchInput],
        queryFn: () => searchProducts(productSearchInput),
        enabled: !!productSearchInput,
    });


    useEffect(() => {
        if (!open) {
            setWarehouseId(null);
            setAccountId(null);
            setComment('');
            setItems([]);
            setSelectedProduct(null);
            setQuantity(1);
            setCostPrice('');
        }
    }, [open]);

    useEffect(() => {
        setAccountId(null);
    }, [movementType]);

    const filteredAccounts = useMemo(() => {
        if (movementType === 'INBOUND') {
            return accounts.filter(acc => acc.type === 'SUPPLIER');
        }
        if (movementType === 'OUTBOUND') {
            return accounts.filter(acc => acc.type === 'DEALER');
        }
        return [];
    }, [accounts, movementType]);

    const accountLabel = useMemo(() => {
        if (movementType === 'INBOUND') return 'Поставщик';
        if (movementType === 'OUTBOUND') return 'Дилер (Получатель)';
        return 'Контрагент';
    }, [movementType]);

    const handleAddItem = () => {
        if (!selectedProduct || quantity === '') return;

        if (movementType === 'ADJUSTMENT' && quantity === 0) {
            alert('Изменение не может быть равно нулю.');
            return;
        }
        if (movementType !== 'ADJUSTMENT' && quantity <= 0) {
            alert('Количество должно быть положительным.');
            return;
        }
        if (movementType === 'INBOUND' && (!costPrice || costPrice < 0)) {
            alert('Себестоимость должна быть положительным числом.');
            return;
        }

        setItems(prev => {
            const existingItemIndex = prev.findIndex(item => item.productId === selectedProduct.id);
            if (existingItemIndex > -1) {
                alert('Этот товар уже добавлен. Вы можете удалить его и добавить заново.');
                return prev;
            }
            return [...prev, {
                productId: selectedProduct.id,
                quantity: quantity,
                costPrice: movementType === 'INBOUND' ? costPrice as number : undefined,
                sellingPrice: movementType === 'OUTBOUND' ? selectedProduct.sellingPrice : undefined,
                productName: selectedProduct.name,
                productCode: selectedProduct.productCode,
            }];
        });

        setSelectedProduct(null);
        setQuantity(movementType === 'ADJUSTMENT' ? '' : 1);
        setCostPrice('');
        setProductSearchInput('');
    };

    const handleRemoveItem = (productId: number) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSubmit = () => {
        if (!warehouseId) return;
        const itemsToSubmit = items.map(({productId, quantity, costPrice}) => ({productId, quantity, costPrice}));

        onSubmit({
            warehouseId,
            movementType,
            comment,
            items: itemsToSubmit,
            financeAccountId: accountId ?? undefined
        });
    };

    const isSubmitDisabled = !warehouseId || items.length === 0 || isSubmitting;
    const quantityLabel = movementType === 'ADJUSTMENT' ? 'Изменение (+/-)' : 'Кол-во';
    const showAccountSelect = movementType === 'INBOUND' || movementType === 'OUTBOUND';

    return (
        <Dialog open={open} maxWidth="md" fullWidth disableEscapeKeyDown={isSubmitting}>
            <DialogTitle>{formTitles[movementType]}</DialogTitle>
            <DialogContent>
                {/* Header section: Warehouse, Account, Comment */}
                <Box sx={{display: 'flex', gap: 2, mt: 2, mb: 3}}>
                    <Autocomplete
                        options={warehouses}
                        getOptionLabel={(option) => option.name}
                        value={warehouses.find(w => w.id === warehouseId) || null}
                        onChange={(_, newValue) => setWarehouseId(newValue?.id || null)}
                        loading={isLoadingWarehouses}
                        disabled={isSubmitting}
                        sx={{width: 300}}
                        renderInput={(params) => <TextField {...params} label="Склад" required/>}
                    />

                    {showAccountSelect && (
                        <Autocomplete
                            options={filteredAccounts}
                            getOptionLabel={(option) => option.name}
                            value={filteredAccounts.find(a => a.id === accountId) || null}
                            onChange={(_, newValue) => setAccountId(newValue?.id || null)}
                            loading={isLoadingAccounts}
                            disabled={isSubmitting}
                            sx={{width: 300}}
                            renderInput={(params) => <TextField {...params} label={accountLabel}/>}
                            noOptionsText="Нет подходящих счетов"
                        />
                    )}

                    <TextField
                        label="Комментарий"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSubmitting}
                        fullWidth
                    />
                </Box>

                <Typography variant="h6" gutterBottom>Товары</Typography>

                {/* Add Item Section */}
                <Paper elevation={2} sx={{p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2}}>
                    <Autocomplete
                        options={productOptions}
                        getOptionLabel={(option) => `${option.productCode} - ${option.name}`}
                        value={selectedProduct}
                        onChange={(_, newValue) => setSelectedProduct(newValue)}
                        inputValue={productSearchInput}
                        onInputChange={(_, newInputValue) => setProductSearchInput(newInputValue)}
                        loading={isLoadingProducts}
                        sx={{flexGrow: 1}}
                        renderInput={(params) => <TextField {...params} label="Поиск товара"/>}
                    />
                    <TextField
                        label={quantityLabel}
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        sx={{width: 150}}
                    />
                    {movementType === 'INBOUND' && (
                        <NumericFormat
                            value={costPrice}
                            thousandSeparator=" "
                            decimalScale={2}
                            fixedDecimalScale={false}
                            allowNegative={false}
                            customInput={TextField}
                            label="Себестоимость"
                            onValueChange={(values) => {
                                setCostPrice(values.floatValue ?? '');
                            }}
                            sx={{width: 150}}
                        />
                    )}
                    <IconButton
                        color="primary"
                        onClick={handleAddItem}
                        disabled={!selectedProduct || quantity === ''}
                        sx={{mt: 1}}
                    >
                        <AddCircleOutlineIcon/>
                    </IconButton>
                </Paper>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Артикул</TableCell>
                                <TableCell>Наименование</TableCell>
                                {movementType === 'INBOUND' && <TableCell align="right">Себестоимость</TableCell>}
                                {movementType === 'OUTBOUND' && <TableCell align="right">Цена продажи</TableCell>}
                                <TableCell align="right">{quantityLabel}</TableCell>
                                <TableCell align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.productId}>
                                    <TableCell>{item.productCode}</TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    {movementType === 'INBOUND' &&
                                        <TableCell align="right">{formatCurrency(item.costPrice)}</TableCell>}
                                    {movementType === 'OUTBOUND' &&
                                        <TableCell align="right">{formatCurrency(item.sellingPrice)}</TableCell>}
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
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitDisabled}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Провести операцию'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};