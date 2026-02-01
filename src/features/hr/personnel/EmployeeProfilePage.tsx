import {type ReactNode, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Chip,
    type ChipProps,
    CircularProgress,
    Fade,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import {useEmployeeProfile} from '../hooks/useEmployeeProfile';
import {PeriodSelector} from './components/PeriodSelector';
import {formatCurrency} from '../../../lib/formatCurrency';
import {formatAppDate} from '../../../lib/formatDate';


type MuiColorType = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

interface StatCardProps {
    icon: ReactNode;
    value: string;
    label: string;
    color: MuiColorType;
    bgColor: string;
}

interface DetailBadgeProps {
    label: string;
    color: 'success' | 'warning' | 'error' | 'primary';
}


const HIDE_THRESHOLD = 5000000;

const LABELS = {
    workedDays: 'Ишлаган кунлари',
    totalShortcoming: 'Жами етишмовчилик',
    totalOvertime: 'Жами қўшимча иш',
    totalLate: 'Жами кечикиш',
    tabTabel: 'Табел',
    tabFinance: 'Молия',
    days: 'кун',
    hours: 'соат',
    minutes: 'дақ',
    history: 'Амалиётлар тарихи',
    emptyHistory: 'Амалиётлар мавжуд эмас',
    status: {
        ABSENT: 'Келмаган',
        WEEKEND: 'Дам олиш',
        HOLIDAY: 'Байрам',
        PRESENT: 'Келган',
    },
    txTypes: {
        SALARY_ACCRUAL: 'Ойлик',
        SALARY_PAYOUT: 'Аванс',
    }
};


const formatDuration = (totalMinutes: number | undefined | null): string => {
    if (!totalMinutes) return '0 ' + LABELS.minutes;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h} ${LABELS.hours} ${m} ${LABELS.minutes}`;
    if (h > 0) return `${h} ${LABELS.hours}`;
    return `${m} ${LABELS.minutes}`;
};

const getShortcomingColor = (mins: number): DetailBadgeProps['color'] => {
    if (mins <= 10) return 'success';
    if (mins <= 30) return 'warning';
    return 'error';
};

const getStatusColor = (status: string): ChipProps['color'] => {
    if (status === 'ABSENT') return 'error';
    if (status === 'WEEKEND' || status === 'HOLIDAY') return 'default';
    return 'success';
};

const getTransactionLabel = (type: string) => {
    // @ts-expect-error tsispain
    return LABELS.txTypes[type] || type;
};


export const EmployeeProfilePage = () => {
    const {id} = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState(0);

    const {data, isLoading, isError, isFetching, ...dateProps} = useEmployeeProfile(Number(id));

    const totalWorkedDays = useMemo(() => {
        if (!data?.days) return 0;
        return data.days.filter(d => (d.workingMinutes || 0) > 0).length;
    }, [data]);

    const filteredTransactions = useMemo(() => {
        if (!data?.finance?.transactions) return [];
        return data.finance.transactions.filter(tx => Math.abs(tx.amount) < HIDE_THRESHOLD);
    }, [data]);

    if (isLoading && !data) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (isError) return <Alert severity="error">Хатолик юз берди</Alert>;

    return (
        <Box sx={{pb: 6, maxWidth: '100%', position: 'relative'}}>

            {/* Хедер (Имя и должность) всегда на месте */}
            {data && (
                <Box sx={{mb: 2, px: 1}}>
                    <Typography variant="h5" fontWeight="800">
                        {data.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                        {data.position} • {data.departmentName}
                    </Typography>
                </Box>
            )}

            <PeriodSelector {...dateProps} />

            {/* Индикатор фоновой загрузки: появляется только при обновлении периода */}
            <Box sx={{width: '100%', height: 4, my: 1}}>
                {isFetching && <LinearProgress sx={{borderRadius: 2}}/>}
            </Box>

            <Paper elevation={0}
                   sx={{mb: 3, borderBottom: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'transparent'}}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab icon={<AccessTimeIcon/>} label={LABELS.tabTabel} sx={{fontWeight: 600}}/>
                    <Tab icon={<AttachMoneyIcon/>} label={LABELS.tabFinance} sx={{fontWeight: 600}}/>
                </Tabs>
            </Paper>
            {data && (
                <Box sx={{
                    transition: 'opacity 0.2s ease',
                    opacity: isFetching ? 0.6 : 1,
                    pointerEvents: isFetching ? 'none' : 'auto'
                }}>
                    {activeTab === 0 && (
                        <Fade in={true} timeout={500}>
                            <Box>
                                <Grid container spacing={2} sx={{mb: 4, px: 0.5}}>
                                    <StatCard
                                        icon={<CalendarTodayIcon/>}
                                        value={`${totalWorkedDays} ${LABELS.days}`}
                                        label={LABELS.workedDays}
                                        color="primary"
                                        bgColor="#e3f2fd"
                                    />
                                    <StatCard
                                        icon={<TimerOffIcon/>}
                                        value={formatDuration(data.totalShortcomingMinutes)}
                                        label={LABELS.totalShortcoming}
                                        color="error"
                                        bgColor="#ffebee"
                                    />
                                    <StatCard
                                        icon={<MoreTimeIcon/>}
                                        value={formatDuration(data.totalOvertimeMinutes)}
                                        label={LABELS.totalOvertime}
                                        color="success"
                                        bgColor="#e8f5e9"
                                    />
                                    <StatCard
                                        icon={<RunningWithErrorsIcon/>}
                                        value={formatDuration(data.totalLateMinutes)}
                                        label={LABELS.totalLate}
                                        color="warning"
                                        bgColor="#fff3e0"
                                    />
                                </Grid>

                                <Stack spacing={2}>
                                    {data.days.map((day) => {
                                        const date = new Date(day.date);
                                        const isWeekend = day.status === 'WEEKEND' || day.status === 'HOLIDAY';
                                        const hasIssues = (day.lateMinutes || 0) > 0 || (day.shortcomingMinutes || 0) > 0;
                                        const hasOvertime = (day.overtimeMinutes || 0) > 0;

                                        return (
                                            <Paper
                                                key={day.date}
                                                elevation={0}
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    borderColor: isWeekend ? 'transparent' : 'divider',
                                                    bgcolor: isWeekend ? '#fafafa' : 'background.paper'
                                                }}
                                            >
                                                <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        minWidth: 50,
                                                        mr: 2,
                                                        pt: 0.5
                                                    }}>
                                                        <Typography variant="h5" fontWeight="700"
                                                                    color={isWeekend ? 'error.main' : 'text.primary'}
                                                                    lineHeight={1}>
                                                            {date.getDate()}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary"
                                                                    sx={{textTransform: 'capitalize'}}>
                                                            {date.toLocaleDateString('uz-UZ', {weekday: 'short'})}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{flex: 1}}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mb: 1
                                                        }}>
                                                            <Typography variant="subtitle1" fontWeight="600">
                                                                {day.checkIn
                                                                    ? `${day.checkIn.substring(0, 5)} - ${day.checkOut?.substring(0, 5) || '...'}`
                                                                    :
                                                                    <span style={{
                                                                        color: '#bdbdbd',
                                                                        fontSize: '0.9em'
                                                                    }}>--:--</span>
                                                                }
                                                            </Typography>
                                                            <Chip
                                                                label={LABELS.status[day.status as keyof typeof LABELS.status] || day.status}
                                                                color={getStatusColor(day.status)}
                                                                size="small"
                                                                variant={day.status === 'ABSENT' ? 'filled' : 'outlined'}
                                                                sx={{fontWeight: 600, height: 24}}
                                                            />
                                                        </Box>

                                                        {(hasIssues || hasOvertime || day.workingMinutes > 0) && (
                                                            <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                                                                {(day.lateMinutes || 0) > 0 && (
                                                                    <DetailBadge
                                                                        label={`Кечикди: ${formatDuration(day.lateMinutes)}`}
                                                                        color="warning"
                                                                    />
                                                                )}
                                                                {(day.shortcomingMinutes || 0) > 0 && (
                                                                    <DetailBadge
                                                                        label={`Етишмади: ${formatDuration(day.shortcomingMinutes)}`}
                                                                        color={getShortcomingColor(day.shortcomingMinutes)}
                                                                    />
                                                                )}
                                                                {(day.overtimeMinutes || 0) > 0 && (
                                                                    <DetailBadge
                                                                        label={`Қўшимча: ${formatDuration(day.overtimeMinutes)}`}
                                                                        color="primary"
                                                                    />
                                                                )}
                                                            </Stack>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Fade>
                    )}

                    {activeTab === 1 && (
                        <Fade in={true} timeout={500}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{px: 1, mb: 2}}>
                                    {LABELS.history}
                                </Typography>

                                {filteredTransactions.length === 0 ? (
                                    <Box sx={{p: 4, textAlign: 'center', color: 'text.secondary'}}>
                                        <Typography>{LABELS.emptyHistory}</Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {filteredTransactions.map((tx) => {
                                            const isPositive = tx.amount > 0;
                                            const txLabel = getTransactionLabel(tx.type);

                                            return (
                                                <Paper key={tx.id} elevation={0} variant="outlined"
                                                       sx={{p: 2, borderRadius: 3}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <Avatar sx={{
                                                            bgcolor: isPositive ? '#e8f5e9' : '#fff3e0',
                                                            color: isPositive ? 'success.main' : 'warning.dark',
                                                            width: 40, height: 40, mr: 2
                                                        }}>
                                                            {isPositive ? <TrendingUpIcon/> : <TrendingDownIcon/>}
                                                        </Avatar>

                                                        <Box sx={{flex: 1}}>
                                                            <Typography variant="body1"
                                                                        fontWeight="600">{txLabel}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatAppDate(tx.transactionDate)}
                                                            </Typography>
                                                            {tx.description && (
                                                                <Typography variant="caption" display="block"
                                                                            color="text.secondary"
                                                                            sx={{mt: 0.5}}>
                                                                    {tx.description}
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="700"
                                                            color={isPositive ? 'success.main' : 'text.primary'}
                                                        >
                                                            {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Fade>
                    )}
                </Box>
            )}
        </Box>
    );
};


const StatCard = ({icon, value, label, color, bgColor}: StatCardProps) => (
    <Grid size={{xs: 6, md: 3}}>
        <Paper
            elevation={0}
            sx={{
                p: 2,
                height: '100%',
                bgcolor: bgColor,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.03)'
            }}
        >
            <Box sx={{color: `${color}.main`, mb: 1}}>
                {icon}
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{color: '#2d3436', fontSize: '1rem', mb: 0.5}}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{color: 'text.secondary', fontWeight: 500, lineHeight: 1.2}}>
                {label}
            </Typography>
        </Paper>
    </Grid>
);

const DetailBadge = ({label, color}: DetailBadgeProps) => {
    let bg = '';
    let text = '';

    switch (color) {
        case 'success':
            bg = '#e8f5e9';
            text = '#2e7d32';
            break;
        case 'warning':
            bg = '#fff3e0';
            text = '#ef6c00';
            break;
        case 'error':
            bg = '#ffebee';
            text = '#c62828';
            break;
        case 'primary':
            bg = '#e3f2fd';
            text = '#1565c0';
            break;
        default:
            bg = '#f5f5f5';
            text = '#000';
    }

    return (
        <Box sx={{
            bgcolor: bg,
            color: text,
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            {label}
        </Box>
    );
};