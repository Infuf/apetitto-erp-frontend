import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    TextField
} from '@mui/material';
import type {AccountType} from '../types';

const accountTypes: { value: AccountType; label: string }[] = [
    {value: 'CASHBOX', label: 'Касса (Наличные)'},
    {value: 'BANK', label: 'Банковский счет'},
    {value: 'DEALER', label: 'Дилер (Клиент)'},
    {value: 'SUPPLIER', label: 'Поставщик'},
    {value: 'EMPLOYEE', label: 'Сотрудник'},
    {value: 'OWNER', label: 'Собственник / Инвестор'},
];
export type AccountFormData = z.infer<typeof accountSchema>;
const accountSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    type: z.enum(['CASHBOX', 'BANK', 'SUPPLIER', 'DEALER', 'EMPLOYEE', 'OWNER']),
    description: z.string().optional(),
    discountPercentage: z
        .number()
        .min(0, 'Не может быть меньше 0')
        .max(100, 'Не может быть больше 100')
        .optional(),
});

interface AccountFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: AccountFormData) => void;
    isSubmitting: boolean;
}

export const AccountForm = ({
                                open,
                                onClose,
                                onSubmit,
                                isSubmitting,
                            }: AccountFormProps) => {
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        control,
        watch,
        setValue,
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: 'CASHBOX',
            description: '',
            discountPercentage: undefined,
        },
    });

    const accountType = watch('type');
    const isDealer = accountType === 'DEALER';

    useEffect(() => {
        if (!isDealer) {
            setValue('discountPercentage', undefined);
        }
    }, [isDealer, setValue]);

    useEffect(() => {
        if (!open) {
            reset({
                name: '',
                type: 'CASHBOX',
                description: '',
                discountPercentage: undefined,
            });
        }
    }, [open, reset]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit(onSubmit),
            }}
        >
            <DialogTitle>Новый счет / Контрагент</DialogTitle>

            <DialogContent>
                <Grid container spacing={2} sx={{mt: 1}}>
                    <Grid size={8}>
                        <TextField
                            autoFocus
                            label="Название"
                            placeholder="Например: Основная касса или ООО «Поставщик»"
                            fullWidth
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isSubmitting}
                        />
                    </Grid>

                    <Grid size={8}>
                        <Controller
                            name="type"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Тип счета"
                                    fullWidth
                                    error={!!errors.type}
                                    helperText={errors.type?.message}
                                    disabled={isSubmitting}
                                >
                                    {accountTypes.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    {isDealer && (
                        <Grid size={8}>
                            <TextField
                                label="Процент скидки (%)"
                                type="number"
                                placeholder="Например: 5"
                                fullWidth
                                {...register('discountPercentage', {
                                    valueAsNumber: true,
                                })}
                                error={!!errors.discountPercentage}
                                helperText={errors.discountPercentage?.message}
                                disabled={isSubmitting}
                                inputProps={{
                                    min: 0,
                                    max: 100,
                                }}
                            />
                        </Grid>
                    )}

                    <Grid size={8}>
                        <TextField
                            label="Описание / Заметки"
                            fullWidth
                            multiline
                            rows={3}
                            {...register('description')}
                            disabled={isSubmitting}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>
                    Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
