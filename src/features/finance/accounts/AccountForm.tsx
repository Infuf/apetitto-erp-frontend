import {useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    MenuItem, CircularProgress, Grid
} from '@mui/material';
import type {AccountFormData, AccountType} from '../types';

const accountTypes: { value: AccountType; label: string }[] = [
    {value: 'CASHBOX', label: 'Касса (Наличные)'},
    {value: 'BANK', label: 'Банковский счет'},
    {value: 'DEALER', label: 'Дилер (Клиент)'},
    {value: 'SUPPLIER', label: 'Поставщик'},
    {value: 'EMPLOYEE', label: 'Сотрудник'},
    {value: 'OWNER', label: 'Собственник / Инвестор'},
];

const accountSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    type: z.enum(['CASHBOX', 'BANK', 'SUPPLIER', 'DEALER', 'EMPLOYEE', 'OWNER']),
    description: z.string().optional(),
});

interface AccountFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: AccountFormData) => void;
    isSubmitting: boolean;
}

export const AccountForm = ({open, onClose, onSubmit, isSubmitting}: AccountFormProps) => {
    const {register, handleSubmit, formState: {errors}, reset, control} = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: 'CASHBOX',
            description: '',
        }
    });

    useEffect(() => {
        if (!open) {
            reset({name: '', type: 'CASHBOX', description: ''});
        }
    }, [open, reset]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                PaperProps={{component: 'form', onSubmit: handleSubmit(onSubmit)}}>
            <DialogTitle>Новый счет / Контрагент</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{mt: 1}}>
                    <Grid size={8}>
                        <TextField
                            autoFocus
                            label="Название"
                            placeholder="Например: Основная касса или ООО 'Поставщик'"
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
                                    {accountTypes.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>
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
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};