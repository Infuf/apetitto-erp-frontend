export function toIsoUtc(dateStr: string | null, endOfDay = false): string | null {
    if (!dateStr) return null;
    const localDate = new Date(dateStr);
    if (endOfDay) {
        localDate.setHours(23, 59, 59, 999);
    } else {
        localDate.setHours(0, 0, 0, 0);
    }
    return localDate.toISOString();
}
