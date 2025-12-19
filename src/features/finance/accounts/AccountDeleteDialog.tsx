import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert, Box, CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface AccountDeleteDialogProps {
    account: { id: number; name: string } | null;
    onClose: () => void;
    onConfirm: (id: number) => void;
    isDeleting: boolean;
}

export const AccountDeleteDialog = ({ account, onClose, onConfirm, isDeleting }: AccountDeleteDialogProps) => {
    const [confirmationInput, setConfirmationInput] = useState('');

    useEffect(() => {
        if (account) {
            setConfirmationInput('');
        }
    }, [account]);

    if (!account) return null;

    const handleSubmit = () => {
        if (confirmationInput === account.name) {
            onConfirm(account.id);
        }
    };

    const isFormValid = confirmationInput === account.name;

    return (
        <Dialog open={!!account} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
                <WarningAmberIcon /> Удаление счета
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Alert severity="error" icon={false} sx={{ border: '1px solid #d32f2f', color: '#d32f2f', fontWeight: 'bold' }}>
                        Внимание! Это действие удалит счет "{account.name}" из списка.
                        <br />
                        История транзакций сохранится в базе, но счет станет недоступен для новых операций.
                    </Alert>

                    <Typography variant="body1">
                        Для подтверждения введите полное название счета: <strong>{account.name}</strong>
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder={account.name}
                        value={confirmationInput}
                        onChange={(e) => setConfirmationInput(e.target.value)}
                        disabled={isDeleting}
                        error={confirmationInput.length > 0 && confirmationInput !== account.name}
                        autoFocus
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={isDeleting} color="inherit">
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={!isFormValid || isDeleting}
                >
                    {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Удалить счет'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};