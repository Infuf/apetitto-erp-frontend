import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Часы
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Дни
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // Недоработка
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Переработка
import {usePayroll} from '../hooks/usePayroll';
import {formatCurrency} from '../../../../lib/formatCurrency';

interface Props {
    payrollId: number | null;
    onClose: () => void;
}

const formatDecimalHours = (decimalHours: number | undefined): string => {
    if (!decimalHours) return '0ч 0мин';
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}ч ${minutes}мин`;
};

const TimeStat = ({icon, label, value, color = 'text.primary'}: any) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: '1px solid #eee'
    }}>
        <Box sx={{color: 'action.active', display: 'flex'}}>{icon}</Box>
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>{label}</Typography>
            <Typography variant="body2" fontWeight="bold" color={color}>{value}</Typography>
        </Box>
    </Box>
);

export const PayrollPayslipDialog = ({payrollId, onClose}: Props) => {
    const {usePayrollDetails} = usePayroll();
    const {data, isLoading, isError} = usePayrollDetails(payrollId);

    if (!payrollId) return null;

    return (
        <Dialog open={!!payrollId} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#fafafa',
                borderBottom: '1px solid #eee'
            }}>
                <Box>
                    Расчетный лист #{payrollId}
                    {data?.status === 'CANCELLED' && (
                        <Chip label="ОТМЕНЕН" color="error" size="small" sx={{ml: 1, fontWeight: 'bold'}}/>
                    )}
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon/></IconButton>
            </DialogTitle>

            <DialogContent sx={{p: 0}}>
                {isLoading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p: 6}}><CircularProgress/></Box>
                ) : isError || !data ? (
                    <Box sx={{p: 3}}><Alert severity="error">Не удалось загрузить данные расчетного листа</Alert></Box>
                ) : (
                    <Box sx={{p: 3}}>

                        <Box sx={{mb: 3}}>
                            <Typography variant="h5" fontWeight="bold">{data.employeeName}</Typography>
                            <Typography variant="body2" color="text.secondary">{data.departmentName}</Typography>
                            <Box sx={{
                                mt: 1,
                                display: 'inline-flex',
                                bgcolor: '#e3f2fd',
                                color: '#1565c0',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.875rem',
                                fontWeight: 'medium'
                            }}>
                                Период: {data.periodStart} — {data.periodEnd}
                            </Box>
                        </Box>

                        <Typography variant="subtitle2" gutterBottom sx={{
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            color: 'text.disabled',
                            letterSpacing: 1
                        }}>
                            Учет времени
                        </Typography>

                        <Grid container spacing={2} sx={{mb: 4}}>
                            <Grid size={{xs: 6}}>
                                <TimeStat
                                    icon={<CalendarMonthIcon/>}
                                    label="Отработано дней"
                                    value={`${data.daysWorked} дн.`}
                                />
                            </Grid>
                            <Grid size={{xs: 6}}>
                                <TimeStat
                                    icon={<AccessTimeIcon/>}
                                    label="Отработано часов"
                                    value={formatDecimalHours(data.totalWorkedHours)}
                                />
                            </Grid>
                            <Grid size={{xs: 6}}>
                                <TimeStat
                                    icon={<TrendingDownIcon/>}
                                    label="Недоработки"
                                    value={formatDecimalHours(data.totalUndertimeHours)}
                                    color={data.totalUndertimeHours > 0 ? "error.main" : "text.secondary"}
                                />
                            </Grid>
                            <Grid size={{xs: 6}}>

                                <TimeStat
                                    icon={<TrendingUpIcon/>}
                                    label="Переработки"
                                    value={formatDecimalHours(data.totalOvertimeHours)}
                                    color={data.totalOvertimeHours > 0 ? "success.main" : "text.secondary"}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" gutterBottom sx={{
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            color: 'text.disabled',
                            letterSpacing: 1
                        }}>
                            Расчет
                        </Typography>

                        <Paper variant="outlined" sx={{p: 2, bgcolor: '#fff'}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography color="text.secondary">Базовая часть</Typography>
                                <Typography fontWeight="medium">{formatCurrency(data.baseAmount)}</Typography>
                            </Box>

                            {data.bonusAmount > 0 && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                    color: 'success.main'
                                }}>
                                    <Typography>+ Бонусы / Переработки</Typography>
                                    <Typography fontWeight="medium">+{formatCurrency(data.bonusAmount)}</Typography>
                                </Box>
                            )}

                            {data.penaltyAmount > 0 && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                    color: 'error.main'
                                }}>
                                    <Typography>- Штрафы / Недоработки</Typography>
                                    <Typography
                                        fontWeight="medium">-{formatCurrency(data.penaltyAmount)}</Typography>
                                </Box>
                            )}

                            <Divider sx={{my: 1.5}}/>

                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h6" fontWeight="bold">К выдаче:</Typography>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    {formatCurrency(data.finalAmount)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{p: 2, borderTop: '1px solid #eee'}}>
                <Button onClick={onClose} color="inherit">Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
};