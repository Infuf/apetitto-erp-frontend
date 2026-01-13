import type {AttendanceStatus} from '../types';


export const getAttendanceColor = (
    status: AttendanceStatus,
    shortcomingMinutes: number = 0
): string => {
    if (status === 'ABSENT' || status === 'FUTURE') {
        return '#e0e0e0';
    }

    if (status === 'PRESENT') {
        if (shortcomingMinutes >= 30) {
            return '#d32f2f';
        }
        if (shortcomingMinutes >= 10) {
            return '#ed6c02';
        }
        return '#2e7d32';
    }

    return '#e0e0e0';
};