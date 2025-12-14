import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import type {PasswordResetFormData} from './types';

const passwordSchema = z.object({
    newPassword: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

interface PasswordResetFormProps {
    username: string | null;
    onClose: () => void;
    onSubmit: (data: PasswordResetFormData) => void;
    isSubmitting: boolean;
}

export const PasswordResetForm = ({ username, onClose, onSubmit, isSubmitting }: PasswordResetFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<PasswordResetFormData>({
        resolver: zodResolver(passwordSchema),
    });

    if (!username) return null;

    return (
        <Dialog open={!!username} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}>
            <DialogTitle>Сброс пароля для: {username}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Новый пароль"
                    type="password"
                    fullWidth
                    variant="standard"
                    {...register('newPassword')}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Сбросить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};