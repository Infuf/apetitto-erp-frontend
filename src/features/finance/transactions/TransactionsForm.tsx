import {useEffect, useMemo} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, MenuItem, CircularProgress, Grid, Autocomplete, Box, Typography
} from '@mui/material';
import {useFinanceDirectories} from '../hooks/useFinanceDirectories';
import {OPERATION_CONFIG} from './transactionConfig';
import {transactionSchema, type TransactionFormData} from './transactionSchema';
import type {TransactionCreateRequestDto, TransactionType} from '../types';

interface TransactionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TransactionCreateRequestDto) => void;
    isSubmitting: boolean;
    initialType?: TransactionType;
}

const operationTypesList: { value: TransactionType; label: string }[] = [
    {value: 'INCOME', label: 'Доход (Выручка)'},
    {value: 'EXPENSE', label: 'Расход'},
    {value: 'TRANSFER', label: 'Перевод'},
    {value: 'PAYMENT_TO_SUPP', label: 'Оплата поставщику'},
    {value: 'PAYMENT_FROM_DLR', label: 'Оплата от дилера'},
    {value: 'OWNER_WITHDRAW', label: 'Вывод средств'},
];

export const TransactionForm = ({
                                    open,
                                    onClose,
                                    onSubmit,
                                    isSubmitting,
                                    initialType = 'EXPENSE'
                                }: TransactionFormProps) => {
    const {useAccounts, categories, isLoadingCategories} = useFinanceDirectories();
    const {
        data: accounts = [],
    } = useAccounts();

    const {control, handleSubmit, watch, reset, register, setValue, formState: {errors}} = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            operationType: initialType,
            amount: 0,
            transactionDate: new Date(),
            description: '',
            fromAccountId: null,
            toAccountId: null,
            categoryId: null,
            subCategoryId: null,
        },
    });


    const operationType = watch('operationType');
    const selectedCategoryId = watch('categoryId');

    const config = OPERATION_CONFIG[operationType];

    const sourceAccounts = useMemo(() =>
            accounts.filter(acc => config.allowedFromTypes.includes(acc.type)),
        [accounts, config]);

    const destinationAccounts = useMemo(() =>
            accounts.filter(acc => config.allowedToTypes.includes(acc.type)),
        [accounts, config]);

    const subcategories = useMemo(() => {
        if (!selectedCategoryId) return [];
        const category = categories.find(c => c.id === selectedCategoryId);
        return category?.subcategories || [];
    }, [categories, selectedCategoryId]);


    useEffect(() => {
        setValue('fromAccountId', null);
        setValue('toAccountId', null);
        setValue('categoryId', null);
        setValue('subCategoryId', null);
    }, [operationType, setValue]);


    const handleFormSubmit = (data: TransactionFormData) => {
        const payload: TransactionCreateRequestDto = {
            ...data,
            transactionDate: new Date().toISOString(),
            fromAccountId: data.fromAccountId ?? undefined,
            toAccountId: data.toAccountId ?? undefined,
            categoryId: data.categoryId ?? undefined,
            subcategoryId: data.subCategoryId ?? undefined,
        };
        onSubmit(payload);
        reset();
    };

    return (
        <Dialog open={open} onClose={(_event, reason) => {
            if (reason !== 'backdropClick') {
                onClose();

            }
        }} maxWidth="sm" fullWidth
                PaperProps={{component: 'form', onSubmit: handleSubmit(handleFormSubmit)}}>
            <DialogTitle>Новая операция</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{mt: 0.5}}>

                    <Grid size={{xs: 12}}>

                        <Controller
                            name="operationType"
                            control={control}
                            render={({field}) => (
                                <TextField {...field} select label="Тип операции" fullWidth>
                                    {operationTypesList.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>

                        <TextField
                            label="Сумма"
                            type="number"
                            fullWidth
                            {...register('amount')}
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                        />
                    </Grid>

                    {config.requiresFrom && (
                        <Grid size={{xs: 12}}>

                            <Controller
                                name="fromAccountId"
                                control={control}
                                render={({field: {onChange, value, ref}}) => (
                                    <Autocomplete
                                        options={sourceAccounts}
                                        getOptionLabel={(opt) => `${opt.name} (${opt.type})`}
                                        value={sourceAccounts.find(a => a.id === value) || null}
                                        onChange={(_, val) => onChange(val?.id || null)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={config.fromLabel}
                                                inputRef={ref}
                                                error={!!errors.fromAccountId}
                                                helperText={errors.fromAccountId?.message}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Box>
                                                    {option.name}
                                                    <Typography variant="caption" display="block"
                                                                color="text.secondary">
                                                        Баланс: {option.balance.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </li>
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    {/* Dynamic Destination Account */}
                    {config.requiresTo && (
                        <Grid size={{xs: 12}}>

                            <Controller
                                name="toAccountId"
                                control={control}
                                render={({field: {onChange, value, ref}}) => (
                                    <Autocomplete
                                        options={destinationAccounts}
                                        getOptionLabel={(opt) => `${opt.name} (${opt.type})`}
                                        value={destinationAccounts.find(a => a.id === value) || null}
                                        onChange={(_, val) => onChange(val?.id || null)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={config.toLabel}
                                                inputRef={ref}
                                                error={!!errors.toAccountId}
                                                helperText={errors.toAccountId?.message}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Box>
                                                    {option.name}
                                                    <Typography variant="caption" display="block"
                                                                color="text.secondary">
                                                        Баланс: {option.balance.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </li>
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    {/* Categories & Subcategories */}
                    {config.requiresCategory && (
                        <>

                            <Grid size={{xs: 12}}>

                                <Controller
                                    name="categoryId"
                                    control={control}
                                    render={({field: {onChange, value, ref}}) => (
                                        <Autocomplete
                                            options={categories}
                                            getOptionLabel={(opt) => opt.name}
                                            value={categories.find(c => c.id === value) || null}
                                            onChange={(_, val) => {
                                                onChange(val?.id || null);
                                                setValue('subCategoryId', null); // Reset subcategory
                                            }}
                                            loading={isLoadingCategories}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Статья (Категория)"
                                                    inputRef={ref}
                                                    error={!!errors.categoryId}
                                                    helperText={errors.categoryId?.message}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {isLoadingCategories && <CircularProgress size={20}/>}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>

                            {subcategories.length > 0 && (

                                <Grid size={{xs: 12}}>

                                    <Controller
                                        name="subCategoryId"
                                        control={control}
                                        render={({field: {onChange, value, ref}}) => (
                                            <Autocomplete
                                                options={subcategories}
                                                getOptionLabel={(opt) => opt.name}
                                                value={subcategories.find(s => s.id === value) || null}
                                                onChange={(_, val) => onChange(val?.id || null)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Подкатегория"
                                                        inputRef={ref}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                </Grid>
                            )}
                        </>
                    )}
                    <Grid size={{xs: 12}}>

                        <TextField
                            label="Комментарий"
                            fullWidth
                            multiline
                            rows={2}
                            {...register('description')}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Провести'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};