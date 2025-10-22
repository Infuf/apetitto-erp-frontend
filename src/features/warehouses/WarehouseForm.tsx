import {useForm} from 'react-hook-form';
import {useEffect} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import type {Warehouse} from "./types.ts";

const warehouseSchema = z.object({
    name: z.string().min(1, 'Название обязательно для заполнения'),
    location: z.string().min(1, 'Расположение обязательно для заполнения'),
    description: z.string().optional(),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: WarehouseFormData) => void;
    isSubmitting: boolean;
    initialData?: Warehouse | null;
}

export const WarehouseForm = ({open, onClose, onSubmit, isSubmitting, initialData}: WarehouseFormProps) => {
    const {register, handleSubmit, formState: {errors}, reset} = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema),
    });
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                name: '',
                location: '',
                description: '',
            });
        }
    }, [initialData, reset]);
    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{initialData ? 'Редактирование склад' : 'Новый склад'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название"
                        fullWidth
                        variant="outlined"
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Расположение"
                        fullWidth
                        variant="outlined"
                        {...register('location')}
                        error={!!errors.location}
                        helperText={errors.location?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        {...register('description')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24}/> : 'Сохранить'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};