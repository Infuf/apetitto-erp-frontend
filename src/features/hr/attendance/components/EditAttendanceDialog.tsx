import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAttendance } from '../../hooks/useAttendance';
import { format, isFuture, parseISO } from 'date-fns';
import { uz } from 'date-fns/locale';

interface EditAttendanceDialogProps {
    employeeId: number | null;
    date: string | null;
    onClose: () => void;
}

interface FormValues {
    checkIn: string;
    checkOut: string;
}

export const EditAttendanceDialog = ({ employeeId, date, onClose }: EditAttendanceDialogProps) => {
    const { useRecord, updateAttendance } = useAttendance();
    const { data: record, isLoading, isError } = useRecord(employeeId, date);
    const { register, handleSubmit, reset, setValue } = useForm<FormValues>();

    useEffect(() => {
        if (record) {
            reset({
                checkIn: record.actualCheckIn?.substring(0, 5) || '',
                checkOut: record.actualCheckOut?.substring(0, 5) || '',
            });
        }
    }, [record, reset]);

    const onSubmit = (data: FormValues) => {
        if (!employeeId || !date) return;

        const checkIn = data.checkIn ? `${data.checkIn}:00` : null;
        const checkOut = data.checkOut ? `${data.checkOut}:00` : null;

        updateAttendance.mutate(
            { employeeId, date, checkIn, checkOut },
            { onSuccess: () => onClose() }
        );
    };

    const handleClear = () => {
        if (!employeeId || !date) return;

        setValue('checkIn', '');
        setValue('checkOut', '');

        updateAttendance.mutate(
            { employeeId, date, checkIn: null, checkOut: null },
            { onSuccess: () => onClose() }
        );
    };

    if (!employeeId || !date) return null;

    const isDateInFuture = isFuture(parseISO(date));
    const isReadOnly = isDateInFuture;
    const dateTitle = format(parseISO(date), 'd MMMM yyyy (EEEE)', { locale: uz });

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Smenani tahrirlash
                {!isReadOnly && (record?.actualCheckIn || record?.actualCheckOut) && (
                    <Tooltip title="Smenani tozalash (belgilarni o‘chirish)">
                        <IconButton onClick={handleClear} color="error" size="small">
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </DialogTitle>

            <DialogContent>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error">
                        Maʼlumotlarni yuklab bo‘lmadi
                    </Alert>
                ) : record ? (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {record.employeeName}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {dateTitle}
                        </Typography>

                        {record.expectedStartTime && (
                            <Alert severity="info" sx={{ mt: 2, mb: 3, py: 0 }}>
                                Reja: {record.expectedStartTime.substring(0, 5)} – {record.expectedEndTime?.substring(0, 5)}
                            </Alert>
                        )}

                        <form id="attendance-form" onSubmit={handleSubmit(onSubmit)}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Kelish vaqti"
                                    type="time"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('checkIn')}
                                    disabled={isReadOnly || updateAttendance.isPending}
                                />
                                <TextField
                                    label="Ketish vaqti"
                                    type="time"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('checkOut')}
                                    disabled={isReadOnly || updateAttendance.isPending}
                                />
                            </Box>
                        </form>

                        {isReadOnly && (
                            <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ mt: 2, display: 'block' }}
                            >
                                * Kelajakdagi sanalarni tahrirlab bo‘lmaydi
                            </Typography>
                        )}
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Bekor qilish
                </Button>
                <Button
                    type="submit"
                    form="attendance-form"
                    variant="contained"
                    disabled={isReadOnly || updateAttendance.isPending}
                >
                    {updateAttendance.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
