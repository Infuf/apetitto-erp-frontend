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