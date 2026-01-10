import {useMemo, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import {DataGrid, type GridColDef, type GridPaginationModel} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';

import {TransactionCancellationDialog} from './transactions/TransactionCancellationDialog';
import {useFinanceTransactions} from './hooks/useFinanceTransaction';
import {useFinanceDirectories} from './hooks/useFinanceDirectories';
import {TransactionForm} from './transactions/TransactionsForm.tsx';
import {TransactionDetailsModal} from './transactions/TransactionDetailesModal.tsx';
import {formatAppDate} from '../../lib/formatDate';
import {formatCurrency} from '../../lib/formatCurrency';
import type {
    FinanceAccount,
    FinanceFilters,
    TransactionCreateRequestDto,
    TransactionResponseDto,
    TransactionType
} from './types';

const typeLabels: Record<string, { label: string, color: 'success' | 'error' | 'default' | 'primary' | 'warning' }> = {
    INCOME: {label: 'Доход', color: 'success'},
    EXPENSE: {label: 'Расход', color: 'error'},
    TRANSFER: {label: 'Перевод', color: 'default'},
    SUPPLIER_INVOICE: {label: 'Закупка (Долг)', color: 'warning'},
    PAYMENT_TO_SUPP: {label: 'Оплата пост.', color: 'error'},
    DEALER_INVOICE: {label: 'Отгрузка (Долг)', color: 'success'},
    PAYMENT_FROM_DLR: {label: 'Оплата дилера', color: 'success'},
    SALARY_PAYOUT: {label: 'Зарплата', color: 'error'},
    OWNER_WITHDRAW: {label: 'Вывод', color: 'default'},
};

const accountTypesFilter = [
    {label: 'Кассы и Банки', value: ['CASHBOX', 'BANK']},
    {label: 'Поставщики', value: ['SUPPLIER']},
    {label: 'Дилеры', value: ['DEALER']},
    {label: 'Сотрудники', value: ['EMPLOYEE']},
    {label: 'Собственники', value: ['OWNER']},
];

export const FinancePage = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({page: 0, pageSize: 25});
    const [modalType, setModalType] = useState<TransactionType | null>(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    const [transactionToCancel, setTransactionToCancel] = useState<number | null>(null);

    const [selectedAccountType, setSelectedAccountType] = useState<string[]>(['CASHBOX', 'BANK']);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

    const [dateFilters, setDateFilters] = useState<{ dateFrom: string | null, dateTo: string | null }>({
        dateFrom: null,
        dateTo: null
    });

    const [activeFilters, setActiveFilters] = useState<FinanceFilters>({accountId: null, dateFrom: null, dateTo: null});

    const {useAccounts} = useFinanceDirectories();
    const {data: allAccounts = []} = useAccounts();

    const {usePaginatedTransactions, createTransaction} = useFinanceTransactions();

    const {data: pageData, isFetching} = usePaginatedTransactions(
        paginationModel.page,
        paginationModel.pageSize,
        activeFilters
    );

    const filteredAccounts = useMemo(() => {
        return allAccounts.filter(acc => selectedAccountType.includes(acc.type));
    }, [allAccounts, selectedAccountType]);

    const selectedAccount = useMemo(() =>
            allAccounts.find(a => a.id === selectedAccountId) || null,
        [allAccounts, selectedAccountId]);

    const handleAccountChange = (account: FinanceAccount | null) => {
        setSelectedAccountId(account?.id || null);

        setPaginationModel(prev => ({...prev, page: 0}));
        setActiveFilters(prev => ({...prev, accountId: account?.id || null}));
    };

    const handleDateFilterApply = () => {
        setPaginationModel(prev => ({...prev, page: 0}));

        let isoFrom = null;
        let isoTo = null;

        if (dateFilters.dateFrom) {
            const fromDate = new Date(dateFilters.dateFrom + 'T00:00:00');
            isoFrom = fromDate.toISOString();
        }

        if (dateFilters.dateTo) {
            const toDate = new Date(dateFilters.dateTo + 'T23:59:59.999');
            isoTo = toDate.toISOString();
        }

        setActiveFilters(prev => ({
            ...prev,
            dateFrom: isoFrom,
            dateTo: isoTo
        }));
    };

    const handleCreateSubmit = (data: TransactionCreateRequestDto) => {
        createTransaction.mutate(data, {
            onSuccess: () => setModalType(null)
        });
    };

    const columns: GridColDef<TransactionResponseDto>[] = [
        {field: 'id', headerName: 'ID', width: 70},
        {
            field: 'transactionDate',
            headerName: 'Дата',
            width: 160,
            renderCell: (params) => formatAppDate(params.value)
        },
        {
            field: 'operationType',
            headerName: 'Тип',
            width: 150,
            renderCell: (params) => {
                const info = typeLabels[params.value] || {label: params.value, color: 'default'};
                return <Chip label={info.label} color={info.color} size="small" variant="outlined"/>;
            }
        },
        {
            field: 'amount',
            headerName: 'Сумма',
            width: 140,
            renderCell: (params) => {
                if (!selectedAccountId) {
                    return (
                        <span style={{fontWeight: 'bold'}}>
                    {formatCurrency(params.value)}
                </span>
                    );
                }
                const isOutgoing = params.row.fromAccountId === selectedAccountId;
                const color = isOutgoing ? '#d32f2f' : '#2e7d32';
                const prefix = isOutgoing ? '-' : '+';
                return <span style={{color, fontWeight: 'bold'}}>{prefix} {formatCurrency(params.value)}</span>;
            }
        },
        {
            field: 'correspondent',
            headerName: 'Корреспондент',
            flex: 1.5,
            renderCell: (params) => {
                const row = params.row;

                if (!selectedAccountId) {
                    return `${row.fromAccountName || '—'} → ${row.toAccountName || row.categoryName || '—'}`;
                }

                if (row.fromAccountId === selectedAccountId) {
                    return `➝ ${row.toAccountName || row.categoryName || 'Неизвестно'}`;
                } else {
                    return `← ${row.fromAccountName || 'Внешний источник'}`;
                }
            }
        },
        {field: 'description', headerName: 'Комментарий', flex: 1},
        {field: 'createdByName', headerName: 'Создан', flex: 1},
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 100,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => setSelectedTransactionId(params.row.id)}
                        title="Детали"
                    >
                        <VisibilityIcon/>
                    </IconButton>

                    {params.row.status !== 'CANCELLED' && (
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => setTransactionToCancel(params.row.id)}
                            title="Отменить транзакцию (Сторно)"
                        >
                            <CancelIcon/>
                        </IconButton>
                    )}
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h4" component="h1">Финансы</Typography>
                <ButtonGroup variant="contained">
                    <Button color="success" startIcon={<AddIcon/>} onClick={() => setModalType('INCOME')}>Доход</Button>
                    <Button color="error" startIcon={<RemoveIcon/>}
                            onClick={() => setModalType('EXPENSE')}>Расход</Button>
                    <Button color="primary" startIcon={<SwapHorizIcon/>}
                            onClick={() => setModalType('TRANSFER')}>Перевод</Button>
                </ButtonGroup>
            </Box>

            <Paper sx={{p: 2, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{xs: 12, md: 3}}>
                        <TextField
                            select
                            label="Тип счета"
                            fullWidth
                            size="small"
                            value={accountTypesFilter.find(t => JSON.stringify(t.value) === JSON.stringify(selectedAccountType))?.label || ''}
                            onChange={(e) => {
                                const selected = accountTypesFilter.find(t => t.label === e.target.value);
                                if (selected) {
                                    setSelectedAccountType(selected.value);
                                    setSelectedAccountId(null);
                                    setActiveFilters(prev => ({...prev, accountId: null}));
                                }
                            }}
                            SelectProps={{native: true}}
                        >
                            {accountTypesFilter.map((option) => (
                                <option key={option.label} value={option.label}>
                                    {option.label}
                                </option>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <Autocomplete
                            options={filteredAccounts}
                            getOptionLabel={(opt) => opt.name}
                            value={selectedAccount}
                            onChange={(_, val) => handleAccountChange(val)}
                            renderInput={(params) => <TextField {...params} label="Выберите счет (Обязательно)"
                                                                size="small"/>}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>

                    <Grid size={{xs: 6, md: 2}}>
                        <TextField
                            label="С"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            value={dateFilters.dateFrom || ''}
                            onChange={(e) => setDateFilters(prev => ({...prev, dateFrom: e.target.value || null}))}
                        />
                    </Grid>
                    <Grid size={{xs: 6, md: 2}}>
                        <TextField
                            label="По"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            value={dateFilters.dateTo || ''}
                            onChange={(e) => setDateFilters(prev => ({...prev, dateTo: e.target.value || null}))}
                        />
                    </Grid>
                    <Grid size={{xs: 12, md: 1}}>
                        <Button variant="outlined" fullWidth startIcon={<SearchIcon/>} onClick={handleDateFilterApply}
                                disabled={false}>
                            Найти
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {selectedAccount && (
                <Card variant="outlined" sx={{mb: 3, bgcolor: '#f5f5f5', borderColor: 'primary.main'}}>
                    <CardContent sx={{py: 2, '&:last-child': {pb: 2}}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Выбранный счет</Typography>
                                <Typography variant="h5" component="div">{selectedAccount.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedAccount.type}</Typography>
                            </Box>
                            <Box sx={{textAlign: 'right'}}>
                                <Typography variant="subtitle2" color="text.secondary">Текущий баланс</Typography>
                                <Typography
                                    variant="h4"
                                    color={selectedAccount.balance < 0 ? 'error' : 'success'}
                                    sx={{fontWeight: 'bold'}}
                                >
                                    {formatCurrency(selectedAccount.balance)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Box sx={{height: 600, width: '100%'}}>
                    <DataGrid
                        rows={pageData?.content ?? []}
                        columns={columns}
                        rowCount={pageData?.totalElements ?? 0}
                        loading={isFetching}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        disableRowSelectionOnClick
                        sx={{'& .MuiDataGrid-columnHeaders': {bgcolor: '#f5f5f5'}}}
                    />
            </Box>

            {modalType && (
                <TransactionForm
                    open={!!modalType}
                    onClose={() => setModalType(null)}
                    onSubmit={handleCreateSubmit}
                    isSubmitting={createTransaction.isPending}
                    initialType={modalType}
                />
            )}

            <TransactionDetailsModal
                transactionId={selectedTransactionId}
                onClose={() => setSelectedTransactionId(null)}
            />

            <TransactionCancellationDialog
                transactionId={transactionToCancel}
                onClose={() => setTransactionToCancel(null)}
            />
        </Box>
    );
};