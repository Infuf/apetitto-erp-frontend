import type {AccountType, TransactionType} from '../types';

interface OperationConfig {
    requiresFrom: boolean;
    requiresTo: boolean;
    requiresCategory: boolean;
    allowedFromTypes: AccountType[];
    allowedToTypes: AccountType[];
    fromLabel: string;
    toLabel: string;
}

const INTERNAL_MONEY: AccountType[] = ['CASHBOX', 'BANK'];

export const OPERATION_CONFIG: Record<TransactionType, OperationConfig> = {
    INCOME: {
        requiresFrom: false,
        requiresTo: true,
        requiresCategory: true,
        allowedFromTypes: [],
        allowedToTypes: INTERNAL_MONEY,
        fromLabel: '',
        toLabel: 'Зачислить на (Касса/Банк)',
    },
    EXPENSE: {
        requiresFrom: true,
        requiresTo: false,
        requiresCategory: true,
        allowedFromTypes: INTERNAL_MONEY,
        allowedToTypes: [],
        fromLabel: 'Списать с (Касса/Банк)',
        toLabel: '',
    },
    TRANSFER: {
        requiresFrom: true,
        requiresTo: true,
        requiresCategory: false,
        allowedFromTypes: INTERNAL_MONEY,
        allowedToTypes: INTERNAL_MONEY,
        fromLabel: 'Откуда (Касса/Банк)',
        toLabel: 'Куда (Касса/Банк)',
    },
    SUPPLIER_INVOICE: {
        requiresFrom: false,
        requiresTo: true,
        requiresCategory: false,
        allowedFromTypes: [],
        allowedToTypes: ['SUPPLIER'],
        fromLabel: '',
        toLabel: 'Поставщик (Начисление долга)',
    },
    PAYMENT_TO_SUPP: {
        requiresFrom: true,
        requiresTo: true,
        requiresCategory: false,
        allowedFromTypes: INTERNAL_MONEY,
        allowedToTypes: ['SUPPLIER'],
        fromLabel: 'Списать с (Касса/Банк)',
        toLabel: 'Получатель (Поставщик)',
    },
    DEALER_INVOICE: {
        requiresFrom: true,
        requiresTo: false,
        requiresCategory: false,
        allowedFromTypes: ['DEALER'],
        allowedToTypes: [],
        fromLabel: 'Дилер (Начисление долга)',
        toLabel: '',
    },
    PAYMENT_FROM_DLR: {
        requiresFrom: true,
        requiresTo: true,
        requiresCategory: false,
        allowedFromTypes: ['DEALER'],
        allowedToTypes: INTERNAL_MONEY,
        fromLabel: 'Плательщик (Дилер)',
        toLabel: 'Зачислить на (Касса/Банк)',
    },
    SALARY_PAYOUT: {
        requiresFrom: true,
        requiresTo: true,
        requiresCategory: false,
        allowedFromTypes: INTERNAL_MONEY,
        allowedToTypes: ['EMPLOYEE'],
        fromLabel: 'Списать с (Касса/Банк)',
        toLabel: 'Сотрудник',
    },
    OWNER_WITHDRAW: {
        requiresFrom: true,
        requiresTo: true,
        requiresCategory: false,
        allowedFromTypes: INTERNAL_MONEY,
        allowedToTypes: ['OWNER'],
        fromLabel: 'Списать с (Касса/Банк)',
        toLabel: 'Счет владельца',
    },
};