export type AccountType = 'CASHBOX' | 'BANK' | 'SUPPLIER' | 'DEALER' | 'EMPLOYEE' | 'OWNER';
export type TransactionType =
    | 'INCOME'
    | 'EXPENSE'
    | 'TRANSFER'
    | 'SUPPLIER_INVOICE'
    | 'PAYMENT_TO_SUPP'
    | 'DEALER_INVOICE'
    | 'PAYMENT_FROM_DLR'
    | 'SALARY_PAYOUT'
    | 'OWNER_WITHDRAW';

export interface FinanceAccount {
    id: number;
    name: string;
    type: AccountType;
    balance: number;
    description?: string;
    isActive: boolean;
    userId?: number;
    username?: string;
    createdAt?: string;
}

export interface FinanceCategory {
    id: number;
    name: string;
    type: string;
    isActive: boolean;
    description?: string;
    subcategories: FinanceSubCategory[];
}

export interface FinanceSubCategory {
    id: number;
    categoryId: number;
    name: string;
    isActive: boolean;
}

export interface AccountFormData {
    name: string;
    type: AccountType;
    description?: string;
}

export interface CategoryFormData {
    name: string;
    type: string;
    description?: string;
}

export interface SubCategoryFormData {
    name: string;
}
export interface TransactionCreateRequestDto {
    amount: number;
    operationType: TransactionType;
    transactionDate?: string;
    description?: string;
    fromAccountId?: number;
    toAccountId?: number;
    categoryId?: number;
    subcategoryId?: number;
    // items?: any[]; // Если нужно передавать товары при создании
}

export interface TransactionResponseDto {
    id: number;
    transactionDate: string;
    amount: number;
    operationType: TransactionType;
    status?: string;
    description?: string;

    fromAccountId?: number;
    fromAccountName?: string;

    toAccountId?: number;
    toAccountName?: string;

    categoryId?: number;
    categoryName?: string;

    subcategoryId?: number;
    subcategoryName?: string;

    createdBy?: number;
    createdByName?: string;
}

export interface PageTransactionResponseDto {
    content: TransactionResponseDto[];
    totalElements: number;
    totalPages: number;
}

export interface FinanceFilters {
    accountId: number | null;
    dateFrom: string | null;
    dateTo: string | null;
}