import {useEffect} from 'react';
import {Controller, type Resolver, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../../api/axiosInstance';
import type {CategoryOption, Product} from './types';
import {NumericFormatCustom} from '../../lib/numericFormatCustom.tsx'

const unitOptions = ['PIECE', 'KILOGRAM', 'LITER', 'METER'] as const;

const productSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    productCode: z.string().min(1, 'Артикул обязателен'),
    unit: z.enum(unitOptions),
    categoryId: z.number().nullable().refine(v => v != null, {message: 'Категория обязательна'}),
    description: z.string().optional(),
    barcode: z.string().optional(),
    sellingPrice: z
        .preprocess(
            val => (val === '' || val == null ? undefined : Number(val)),
            z.number().nonnegative({message: 'Цена должна быть >= 0'}).optional()
        ),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => void;
    isSubmitting: boolean;
    initialData?: Product | null;
}

const fetchCategories = async (): Promise<CategoryOption[]> => {
    const {data} = await axiosInstance.get('/categories');
    return data;
};

export const ProductForm = ({
                                open,
                                onClose,
                                onSubmit,
                                isSubmitting,
                                initialData,
                            }: ProductFormProps) => {
    const {data: categories = [], isLoading: isLoadingCategories} = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const resolver = zodResolver(productSchema) as unknown as Resolver<ProductFormData>;

    const {register, handleSubmit, formState: {errors}, reset, control} =
        useForm<ProductFormData>({
            resolver,
            defaultValues: {
                name: '',
                productCode: '',
                unit: 'PIECE',
                categoryId: undefined,
                description: '',
                barcode: '',
                sellingPrice: undefined,
            },
        });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name ?? '',
                productCode: initialData.productCode ?? '',
                unit: unitOptions.includes(initialData.unit as (typeof unitOptions)[number])
                    ? (initialData.unit as (typeof unitOptions)[number])
                    : 'PIECE',
                categoryId: initialData.categoryId ?? null,
                description: initialData.description ?? '',
                barcode: initialData.barcode ?? '',
                sellingPrice: initialData.sellingPrice ?? undefined,
            });
        } else {
            reset();
        }
    }, [initialData, reset]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{component: 'form', onSubmit: handleSubmit(onSubmit)}}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{initialData ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Название"
                    fullWidth
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                />

                <Box sx={{display: 'flex', gap: 2, mt: 1}}>
                    <TextField
                        label="Артикул"
                        fullWidth
                        {...register('productCode')}
                        error={!!errors.productCode}
                        helperText={errors.productCode?.message}
                        disabled={isSubmitting}
                    />
                    <TextField
                        select
                        label="Ед. изм."
                        fullWidth
                        defaultValue="PIECE"
                        {...register('unit')}
                        error={!!errors.unit}
                        helperText={errors.unit?.message}
                        disabled={isSubmitting}
                    >
                        {unitOptions.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Box sx={{mt: 2}}>
                    <Controller
                        name="categoryId"
                        control={control}
                        render={({field, fieldState}) => (
                            <Autocomplete
                                sx={{width: '100%'}}
                                options={categories}
                                getOptionLabel={option => option.name}
                                value={categories.find(c => c.id === field.value) ?? null}
                                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                                loading={isLoadingCategories}
                                disabled={isSubmitting}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label="Категория"
                                        inputRef={field.ref}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isLoadingCategories &&
                                                        <CircularProgress color="inherit" size={20}/>}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        )}
                    />
                </Box>

                <Box sx={{display: 'flex', gap: 2, mt: 2}}>
                    <Controller
                        name="sellingPrice"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                label="Цена продажи"
                                fullWidth
                                error={!!errors.sellingPrice}
                                helperText={errors.sellingPrice?.message}
                                InputProps={{
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    inputComponent: NumericFormatCustom as any,
                                }}
                                disabled={isSubmitting}
                            />
                        )}
                    />
                    <TextField
                        label="Штрих-код"
                        fullWidth
                        {...register('barcode')}
                        error={!!errors.barcode}
                        helperText={errors.barcode?.message}
                        disabled={isSubmitting}
                    />
                </Box>

                <TextField
                    margin="dense"
                    label="Описание"
                    fullWidth
                    multiline
                    rows={3}
                    {...register('description')}
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
