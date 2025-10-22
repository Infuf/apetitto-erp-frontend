import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress
} from '@mui/material';
import type { Category } from './types';

const categorySchema = z.object({
    name: z.string().min(1, 'Название обязательно для заполнения'),
    description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    isSubmitting: boolean;
    initialData?: Category | null;
}

export const CategoryForm = ({ open, onClose, onSubmit, isSubmitting, initialData }: CategoryFormProps) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                name: '',
                description: '',
            });
        }
    }, [initialData, reset]);

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}>
            <DialogTitle>{initialData ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
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
                    disabled={isSubmitting}
                />
                <TextField
                    margin="dense"
                    label="Описание"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    {...register('description')}
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};