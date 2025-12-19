import {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';

import {useFinanceDirectories} from '../hooks/useFinanceDirectories';
import {AccountForm} from './AccountForm';
import {formatCurrency} from '../../../lib/formatCurrency';
import type {AccountFormData, FinanceAccount} from '../types';
import {AccountDeleteDialog} from './AccountDeleteDialog';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = ({children, value, index, ...other}: TabPanelProps) => (
    <div role="tabpanel" hidden={value !== index} {...other} style={{paddingTop: 20}}>
        {value === index && <Box>{children}</Box>}
    </div>
);

const typeIcons: Record<string, React.ReactNode> = {
    CASHBOX: <AccountBalanceWalletIcon color="success"/>,
    BANK: <BusinessIcon color="primary"/>,
    SUPPLIER: <BusinessIcon color="warning"/>,
    DEALER: <BusinessIcon color="info"/>,
    EMPLOYEE: <PersonIcon color="action"/>,
    OWNER: <PersonIcon color="secondary"/>,
};

export const FinanceAccountsPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {useAccounts, createAccount, deleteAccount} = useFinanceDirectories();
    const [accountToDelete, setAccountToDelete] = useState<{ id: number; name: string } | null>(null);
    const {data: accounts = [], isLoading, isError, error} = useAccounts();

    const handleCreate = (data: AccountFormData) => {
        createAccount.mutate(data, {
            onSuccess: () => setIsModalOpen(false),
        });
    };
    const onClickDelete = (id: number, name: string) => {
        setAccountToDelete({id, name});
    };
    const handleConfirmDelete = (id: number) => {
        deleteAccount.mutate(id, {
            onSuccess: () => setAccountToDelete(null), // Закрываем диалог при успехе
        });
    };

    const internalAccounts = accounts.filter(a => ['CASHBOX', 'BANK', 'OWNER'].includes(a.type));
    const partnerAccounts = accounts.filter(a => ['SUPPLIER', 'DEALER'].includes(a.type));
    const employeeAccounts = accounts.filter(a => a.type === 'EMPLOYEE');

    const columns: GridColDef<FinanceAccount>[] = [
        {field: 'id', headerName: 'ID', width: 70},
        {
            field: 'type',
            headerName: 'Тип',
            width: 120,
            renderCell: (params) => <Chip label={params.value} size="small" variant="outlined"/>
        },
        {field: 'name', headerName: 'Название / Имя', flex: 1},
        {
            field: 'balance',
            headerName: 'Баланс (Долг)',
            width: 180,
            renderCell: (params) => {
                const val = params.value as number;
                let color = 'black';
                if (val > 0) color = 'green';
                if (val < 0) color = 'red';
                return <span style={{color, fontWeight: 'bold'}}>{formatCurrency(val)}</span>;
            }
        },
        {
            field: 'discountPercentage',
            headerName: 'Скидка',
            flex: 1.5,
            valueFormatter: (value) => {
                if (value == null || value === 0) return '';
                return `${value}%`;
            },
        },
        {field: 'description', headerName: 'Описание', flex: 1.5},
        {
            field: 'actions',
            headerName: '',
            width: 60,
            renderCell: (params) => (
                <IconButton size="small" onClick={() => onClickDelete(params.row.id, params.row.name)} color="error">
                    <DeleteIcon/>
                </IconButton>
            )
        }
    ];

    if (isLoading) return <CircularProgress/>;
    if (isError) return <Alert severity="error">Ошибка: {(error as Error).message}</Alert>;

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" component="h1">Счета и Контрагенты</Typography>
                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => setIsModalOpen(true)}>
                    Добавить счет
                </Button>
            </Box>

            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Мои средства"/>
                    <Tab label="Контрагенты"/>
                    <Tab label="Сотрудники"/>
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                    {internalAccounts.map((account) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={account.id}>
                            <Card variant="outlined" sx={{height: '100%'}}>
                                <CardContent>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                            {typeIcons[account.type]}
                                            <Typography variant="subtitle2"
                                                        color="text.secondary">{account.type}</Typography>
                                        </Box>
                                        <IconButton size="small"
                                                    onClick={() => onClickDelete(account.id, account.name)}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                    <Typography variant="h6" component="div" gutterBottom>
                                        {account.name}
                                    </Typography>
                                    <Typography variant="h4" color={account.balance < 0 ? 'error' : 'primary'}>
                                        {formatCurrency(account.balance)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                        {account.description || 'Нет описания'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Box sx={{height: 600, width: '100%'}}>
                    <DataGrid
                        rows={partnerAccounts}
                        columns={columns}
                        disableRowSelectionOnClick
                        initialState={{
                            pagination: {paginationModel: {pageSize: 25}},
                        }}
                    />
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Box sx={{height: 600, width: '100%'}}>
                    <DataGrid
                        rows={employeeAccounts}
                        columns={columns}
                        disableRowSelectionOnClick
                    />
                </Box>
            </TabPanel>

            <AccountForm
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={createAccount.isPending}
            />
            <AccountDeleteDialog
                account={accountToDelete}
                onClose={() => setAccountToDelete(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteAccount.isPending}
            />
        </Box>
    );
};