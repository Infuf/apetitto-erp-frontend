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
    discountPercentage?: number;
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
}
export interface TransactionItemViewDto {
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    priceSnapshot: number;
    totalAmount: number;
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
    items?: TransactionItemViewDto[];
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

export interface CancellationRequestDto {
    reason: string;
}

export interface AccountSummary {
    id: number;
    name: string;
    amount: number;
}

export interface MoneyState {
    totalAmount: number;
    details: AccountSummary[];
}

export interface DebtState {
    totalAmount: number;
    topDebtors: AccountSummary[]; // Список топ контрагентов
}

export interface CompanyFinancialStateDto {
    money: MoneyState;
    receivables: DebtState;
    payables: DebtState;
    netBalance: number;
}


export interface ReportSubCategoryDto {
    subCategoryName: string;
    amount: number;
}

export interface CategoryExpenseDto {
    categoryName: string;
    amount: number;
    percentage: number;
    subcategories: ReportSubCategoryDto[];
}

export interface ExpenseReportDto {
    totalExpense: number;
    categories: CategoryExpenseDto[];
}

export interface CategoryIncomeDto {
    categoryName: string;
    amount: number;
    percentage: number;
    subcategories: ReportSubCategoryDto[];
}

export interface IncomeReportDto {
    totalIncome: number;
    categories: CategoryIncomeDto[];
}

export interface PartnerProductDto {
    productName: string;
    unit: string;
    quantity: number;
    amount: number;
    averagePrice: number;
}

export interface PartnerDto {
    partnerId: number;
    partnerName: string;
    totalAmount: number;
    totalQuantity: number;
    shareInGrandTotal: number;
    products: PartnerProductDto[];
}

export interface PartnersAnalysisReportDto {
    grandTotalAmount: number;
    grandTotalQuantity: number;
    partners: PartnerDto[];
}