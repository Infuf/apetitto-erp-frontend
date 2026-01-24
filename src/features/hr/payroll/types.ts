export interface PayrollAccrual {
    id: number;
    employeeId: number;
    employeeName: string;
    departmentName: string;

    periodStart: string;
    periodEnd: string;
    status: 'APPROVED' | 'CANCELLED';

    finalAmount: number;
    baseAmount: number;
    penaltyAmount: number;
    bonusAmount: number;

    daysWorked: number;
    totalWorkedHours: number;
    totalUndertimeHours: number;
    totalOvertimeHours: number;

    calculatedDayRate: number;
    calculatedHourRate: number;
}

export interface PagePayrollAccrualDto {
    content: PayrollAccrual[];
    totalElements: number;
    totalPages: number;
}

export interface PayrollRequestDto {
    periodStart: string;
    periodEnd: string;
    departmentId?: number | null;
    employeeId?: number | null;
}

export interface PayrollFilters {
    dateFrom: string | null;
    dateTo: string | null;
    departmentId: number | null;
    employeeId: number | null;
}