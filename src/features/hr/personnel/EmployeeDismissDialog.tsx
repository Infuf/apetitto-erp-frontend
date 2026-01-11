import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert, Box, CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Employee } from '../types';

interface EmployeeDismissDialogProps {
    employee: Employee | null;
    onClose: () => void;
    onConfirm: (id: number) => void;
    isDeleting: boolean;
}

export const EmployeeDismissDialog = ({ employee, onClose, onConfirm, isDeleting }: EmployeeDismissDialogProps) => {
    const [confirmationInput, setConfirmationInput] = useState('');

    useEffect(() => {
        if (employee) {
            setConfirmationInput('');
        }
    }, [employee]);

    if (!employee) return null;

    const isMatch = confirmationInput.trim() === employee.fullName.trim();

    const handleSubmit = () => {
        if (isMatch) {
            onConfirm(employee.id);
        }
    };

    return (
        <Dialog open={!!employee} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
                <WarningAmberIcon />
                Увольнение сотрудника
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            Это опасное действие!
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                            <li>Пользователь <strong>{employee.username}</strong> потеряет доступ к системе.</li>
                            <li>Финансовый счет сотрудника будет архивирован.</li>
                            <li>Сотрудник будет удален из текущих смен.</li>
                        </ul>
                    </Alert>

                    <Typography variant="body1">
                        Чтобы подтвердить увольнение, введите полное имя сотрудника:
                    </Typography>

                    <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, border: '1px border #ccc', textAlign: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ userSelect: 'text' }}>
                            {employee.fullName}
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        placeholder="Введите ФИО для подтверждения"
                        value={confirmationInput}
                        onChange={(e) => setConfirmationInput(e.target.value)}
                        disabled={isDeleting}
                        error={confirmationInput.length > 0 && !isMatch}
                        helperText={confirmationInput.length > 0 && !isMatch ? "ФИО не совпадает" : ""}
                        autoFocus
                        autoComplete="off"
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={onClose} disabled={isDeleting} color="inherit">
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={!isMatch || isDeleting}
                    startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isDeleting ? 'Увольнение...' : 'Я понимаю последствия, уволить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};