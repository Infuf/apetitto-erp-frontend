import { Box, Typography, Tooltip } from '@mui/material';
import { getAttendanceColor } from '../utils';
import type { GridDayDto } from '../../types';

interface AttendanceCellProps {
    dayData?: GridDayDto;
    onClick: () => void;
}

const getBorderColor = (day?: GridDayDto) => {
    if (!day || day.status === 'FUTURE') return 'transparent';
    if (day.status === 'ABSENT') return '#d32f2f';
    if (day.status === 'PRESENT') {
        if (day.shortcomingMinutes > 30) return '#d32f2f';
        if (day.shortcomingMinutes > 10) return '#ed6c02';
        return '#2e7d32';
    }
    return 'transparent';
};

export const AttendanceCell = ({ dayData, onClick }: AttendanceCellProps) => {
    const bgColor = dayData
        ? getAttendanceColor(dayData.status, dayData.shortcomingMinutes)
        : '#ffffff';

    const isPresent = dayData?.status === 'PRESENT';
    const isFuture = dayData?.status === 'FUTURE';

    const checkIn = dayData?.checkIn ? dayData.checkIn.substring(0, 5) : '';
    const checkOut = dayData?.checkOut ? dayData.checkOut.substring(0, 5) : '';

    let tooltipTitle = '';
    if (dayData) {
        if (isPresent) {
            tooltipTitle = `Вход: ${checkIn} | Выход: ${checkOut}`;
            if (dayData.shortcomingMinutes > 0) tooltipTitle += ` | Недоработка: ${dayData.shortcomingMinutes}м`;
            if (dayData.overtimeMinutes > 0) tooltipTitle += ` | Переработка: ${dayData.overtimeMinutes}м`;
        } else {
            tooltipTitle = dayData.status === 'ABSENT' ? 'Прогул / Неявка' : dayData.status;
        }
    }

    return (
        <Tooltip title={tooltipTitle} arrow enterDelay={500}>
            <Box
                onClick={onClick}
                sx={{
                    width: 54,  // Чуть шире для удобства
                    height: 48, // Чуть выше
                    borderRadius: 1, // Мягкий квадрат
                    bgcolor: isFuture ? '#f9f9f9' : bgColor,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid #eee',
                    // Цветная полоска снизу для быстрой оценки статуса
                    borderBottom: `3px solid ${getBorderColor(dayData)}`,
                    transition: 'all 0.1s',
                    '&:hover': { filter: 'brightness(0.95)', zIndex: 1 },
                    '&:active': { transform: 'scale(0.95)' }
                }}
            >
                {isPresent ? (
                    <>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', lineHeight: 1.1, color: '#333' }}>
                            {checkIn || '--:--'}
                        </Typography>
                        <Box sx={{ height: 2 }} />
                        <Typography sx={{ fontSize: '0.7rem', lineHeight: 1.1, color: 'text.secondary' }}>
                            {checkOut || '--:--'}
                        </Typography>
                    </>
                ) : (
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'text.disabled' }}>
                        {dayData?.status === 'ABSENT' ? 'Н' : ''}
                        {dayData?.status === 'FUTURE' ? '' : ''}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
};