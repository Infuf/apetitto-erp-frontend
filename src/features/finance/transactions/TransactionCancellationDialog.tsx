import {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {useFinanceTransactions} from '../hooks/useFinanceTransaction';
import type {AxiosError} from "axios";

interface TransactionCancellationDialogProps {
    transactionId: number | null;
    onClose: () => void;
}

const CONFIRMATION_WORD = "ОТМЕНА";

export const TransactionCancellationDialog = ({transactionId, onClose}: TransactionCancellationDialogProps) => {
    const {cancelTransaction} = useFinanceTransactions();

    const [reason, setReason] = useState('');
    const [confirmationInput, setConfirmationInput] = useState('');

    useEffect(() => {
        if (transactionId) {
            setReason('');
            setConfirmationInput('');
            cancelTransaction.reset();
        }
    }, [transactionId]);

    const handleSubmit = () => {
        if (transactionId && reason.trim() && confirmationInput.toUpperCase() === CONFIRMATION_WORD) {
            cancelTransaction.mutate(
                {id: transactionId, data: {reason}},
                {
                    onSuccess: () => {
                        onClose();
                    }
                }
            );
        }
    };

    const isFormValid = reason.trim().length > 0 && confirmationInput.toUpperCase() === CONFIRMATION_WORD;

    return (
        <Dialog open={!!transactionId} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f'}}>
                <WarningAmberIcon/> Отмена транзакции #{transactionId}
            </DialogTitle>

            <DialogContent>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, mt: 1}}>
                    <Alert severity="warning">
                        Это действие <strong>отменит финансовую операцию</strong> и откатит изменения балансов на
                        счетах.
                        <br/>
                        Действие будет залогировано.
                    </Alert>

                    <TextField
                        label="Причина отмены (Обязательно)"
                        placeholder="Например: Ошибка оператора, возврат товара..."
                        fullWidth
                        multiline
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        error={cancelTransaction.isError}
                        disabled={cancelTransaction.isPending}
                    />

                    <Box>
                        <Typography variant="body2" gutterBottom>
                            Для подтверждения введите слово <strong>{CONFIRMATION_WORD}</strong> ниже:
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder={CONFIRMATION_WORD}
                            value={confirmationInput}
                            onChange={(e) => setConfirmationInput(e.target.value)}
                            disabled={cancelTransaction.isPending}
                            error={confirmationInput.length > 0 && confirmationInput.toUpperCase() !== CONFIRMATION_WORD}
                        />
                    </Box>

                    {cancelTransaction.isError && (
                        <Alert severity="error">
                            Не удалось отменить: {(cancelTransaction.error as AxiosError<{
                            message: string
                        }>)?.response?.data?.message || "Ошибка сервера"}
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={cancelTransaction.isPending}>
                    Закрыть
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={!isFormValid || cancelTransaction.isPending}
                >
                    {cancelTransaction.isPending ? <CircularProgress size={24} color="inherit"/> : 'Подтвердить отмену'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};