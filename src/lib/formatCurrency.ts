export const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};