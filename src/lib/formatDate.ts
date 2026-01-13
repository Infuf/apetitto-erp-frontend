import {formatInTimeZone} from 'date-fns-tz';

const TIME_ZONE = 'Asia/Tashkent';

export const formatAppDate = (
    date: string | Date | null | undefined,
    formatString = 'dd.MM.yyyy, HH:mm:ss'
): string => {
    if (!date) {
        return '';
    }

    try {
        return formatInTimeZone(date, TIME_ZONE, formatString);
    } catch (error) {
        console.error('Failed to format date:', date, error);
        return 'Invalid Date';
    }
};

export const formatDuration = (minutes: number): string => {
    if (!minutes) return '0';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}s ${m}m`;
    return `${m}m`;
};