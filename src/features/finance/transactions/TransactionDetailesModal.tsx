import {
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {useFinanceTransactions} from '../hooks/useFinanceTransaction';
import {formatAppDate} from '../../../lib/formatDate';
import {formatCurrency} from '../../../lib/formatCurrency';
import TelegramIcon from '@mui/icons-material/Telegram';

interface TransactionDetailsModalProps {
    transactionId: number | null;
    onClose: () => void;
}

const typeLabels: Record<string, string> = {
    INCOME: 'Доход',
    EXPENSE: 'Расход',
    TRANSFER: 'Перевод',
    SUPPLIER_INVOICE: 'Закупка товара',
    PAYMENT_TO_SUPP: 'Оплата поставщику',
    DEALER_INVOICE: 'Отгрузка товара',
    PAYMENT_FROM_DLR: 'Оплата от дилера',
    SALARY_PAYOUT: 'Выплата зарплаты',
    OWNER_WITHDRAW: 'Вывод средств',
};

export const TransactionDetailsModal = ({transactionId, onClose}: TransactionDetailsModalProps) => {
    const {useTransactionDetails} = useFinanceTransactions();
    const {data: transaction, isLoading, isError} = useTransactionDetails(transactionId);

    const handleShareToTelegram = () => {
        if (!transaction) return;

        const typeLabel = typeLabels[transaction.operationType] || transaction.operationType;
        const dateStr = formatAppDate(transaction.transactionDate);
        const amountStr = formatCurrency(transaction.amount);

        let message = `🧾 Чек транзакции #${transaction.id}\n`;
        message += `📅 Дата: ${dateStr}\n`;
        message += `📂 Тип: ${typeLabel}\n`;
        message += `💰 Общая сумма: ${amountStr}\n`;
        message += `-----------------------------\n`;

        if (transaction.fromAccountName) message += `📤 Списано с: ${transaction.fromAccountName}\n`;
        if (transaction.toAccountName) message += `📥 Зачислено на: ${transaction.toAccountName}\n`;

        if (transaction.categoryName) {
            message += `🏷 Категория: ${transaction.categoryName}`;
            if (transaction.subcategoryName) message += ` / ${transaction.subcategoryName}`;
            message += `\n`;
        }

        if (transaction.description) message += `💬 Комментарий: ${transaction.description}\n`;


        if (transaction.items && transaction.items.length > 0) {
            message += `-----------------------------\n`;
            message += `📦 Состав операции:\n`;

            message += '```\n';

            transaction.items.forEach((item) => {
                const itemName = item.productName.length > 10
                    ? item.productName.slice(0, 10) + '…'
                    : item.productName;

                const pricePerUnit = formatCurrency(item.priceSnapshot); // цена за 1 шт
                const quantity = item.quantity;
                const total = formatCurrency(item.totalAmount);

                const line = `${itemName.padEnd(15)} | ${pricePerUnit.padStart(10)} | ${String(quantity).padStart(3)} шт | ${total.padStart(10)}\n`;
                message += line;
            });

            message += '```\n';
        }

        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('Apititto ERP')}&text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    };

    if (!transactionId) return null;

    return (
        <Dialog open={!!transactionId} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider'}}>
                Транзакция #{transactionId}
            </DialogTitle>

            <DialogContent sx={{mt: 2}}>
                {isLoading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : isError || !transaction ? (
                    <Typography color="error" align="center">Не удалось загрузить данные</Typography>
                ) : (
                    <Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Тип операции</Typography>
                                <Chip
                                    label={typeLabels[transaction.operationType] || transaction.operationType}
                                    color="primary"
                                    variant="outlined"
                                    sx={{fontWeight: 'bold', mt: 0.5}}
                                />
                            </Box>
                            <Box sx={{textAlign: 'right'}}>
                                <Typography variant="subtitle2" color="text.secondary">Сумма</Typography>
                                <Typography variant="h4" sx={{fontWeight: 'bold'}}>
                                    {formatCurrency(transaction.amount)}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{my: 2}}/>

                        <Grid container spacing={2} sx={{mb: 3}}>
                            <Grid size={{xs: 6}}>
                                <Typography variant="body2" color="text.secondary">Дата:</Typography>
                                <Typography variant="body1">{formatAppDate(transaction.transactionDate)}</Typography>
                            </Grid>
                            <Grid size={{xs: 6}}>

                                <Typography variant="body2" color="text.secondary">Автор:</Typography>
                                <Typography variant="body1">{transaction.createdByName || 'Система'}</Typography>
                            </Grid>

                            {transaction.fromAccountName && (
                                <Grid size={{xs: 6}}>

                                    <Typography variant="body2" color="text.secondary">Списано со счета:</Typography>
                                    <Typography variant="body1"
                                                fontWeight="medium">{transaction.fromAccountName}</Typography>
                                </Grid>
                            )}

                            {transaction.toAccountName && (
                                <Grid size={{xs: 6}}>

                                    <Typography variant="body2" color="text.secondary">Зачислено на счет:</Typography>
                                    <Typography variant="body1"
                                                fontWeight="medium">{transaction.toAccountName}</Typography>
                                </Grid>
                            )}

                            {transaction.categoryName && (
                                <Grid size={{xs: 12}}>

                                    <Typography variant="body2" color="text.secondary">Категория:</Typography>
                                    <Typography variant="body1">
                                        {transaction.categoryName}
                                        {transaction.subcategoryName && ` / ${transaction.subcategoryName}`}
                                    </Typography>
                                </Grid>
                            )}

                            {transaction.description && (
                                <Grid size={{xs: 12}}>

                                    <Typography variant="body2" color="text.secondary">Комментарий:</Typography>
                                    <Typography variant="body1"
                                                sx={{fontStyle: 'italic', bgcolor: '#f9f9f9', p: 1, borderRadius: 1}}>
                                        {transaction.description}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>

                        {transaction.items && transaction.items.length > 0 && (
                            <>
                                <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                                    Состав операции ({transaction.items.length} поз.)
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead sx={{bgcolor: '#eee'}}>
                                            <TableRow>
                                                <TableCell>Артикул</TableCell>
                                                <TableCell>Наименование</TableCell>
                                                <TableCell align="right">Кол-во</TableCell>
                                                <TableCell align="right">Цена</TableCell>
                                                <TableCell align="right">Сумма</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {transaction.items.map((item) => (
                                                <TableRow key={item.productId}>
                                                    <TableCell>{item.productCode}</TableCell>
                                                    <TableCell>{item.productName}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell
                                                        align="right">{formatCurrency(item.priceSnapshot)}</TableCell>
                                                    <TableCell align="right" sx={{fontWeight: 'bold'}}>
                                                        {formatCurrency(item.totalAmount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} align="right" sx={{fontWeight: 'bold'}}>Итого по
                                                    товарам:</TableCell>
                                                <TableCell align="right" sx={{fontWeight: 'bold'}}>
                                                    {formatCurrency(transaction.items.reduce((sum, i) => sum + i.totalAmount, 0))}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    startIcon={<TelegramIcon/>}
                    variant="outlined"
                    onClick={handleShareToTelegram}
                    disabled={!transaction}
                    sx={{
                        borderColor: '#0088cc',
                        color: '#0088cc',
                        '&:hover': {borderColor: '#0077b5', bgcolor: '#e1f5fe'}
                    }}
                >
                    Поделиться
                </Button>
                <Button onClick={onClose} variant="contained">Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
};

