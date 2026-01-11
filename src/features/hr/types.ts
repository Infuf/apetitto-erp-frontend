export type SalaryType = 'HOURLY' | 'DAILY_SHIFT' | 'FIXED';

export type AttendanceStatus =
    | 'PRESENT'
    | 'ABSENT';

export interface Department {
    id: number;
    name: string;
    description?: string;
    managerId?: number;
    managerName?: string;
}

export interface DepartmentFormData {
    name: string;
    description?: string;
    managerId?: number | null;
}


export interface Employee {
    id: number;
    userId: number;
    username: string;
    fullName: string;
    email?: string;
    roles: string[];
    isUserEnabled: boolean;

    departmentId?: number;
    departmentName?: string;
    positionTitle: string;
    isActive: boolean;

    financeAccountId?: number;
    currentBalance: number;

    salaryType: SalaryType;
    salaryBase: number;
    terminalId?: number;

    shiftStartTime?: string;
    shiftEndTime?: string;
    daysOffPerMonth?: number;
    hiredAt: string;
}

export interface EmployeeCreateDto {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email?: string | null;

    departmentId: number;
    positionTitle: string;

    salaryType: SalaryType;
    salaryBase: number;

    shiftStartTime?: string | null;
    shiftEndTime?: string | null;
    daysOffPerMonth?: number | null;
    terminalId?: number | null;
}

export interface EmployeeUpdateDto {
    firstName: string;
    lastName: string;
    email?: string | null;

    departmentId?: number;
    positionTitle: string;
    isActive?: boolean;

    salaryType: SalaryType;
    salaryBase: number;

    shiftStartTime?: string | null;
    shiftEndTime?: string | null;
    daysOffPerMonth?: number | null;

    terminalId?: number | null;
}

export interface PageEmployeeDto {
    content: Employee[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface GridDayDto {
    date: string;
    status: AttendanceStatus;
    checkIn?: string;
    checkOut?: string;
    shortcomingMinutes: number;
    overtimeMinutes: number;
    recordId?: number;
}

export interface EmployeeGridRowDto {
    employeeId: number;
    fullName: string;
    positionTitle: string;

    totalWorkedHours: number;
    totalShortcomingMinutes: number;
    totalOvertimeMinutes: number;

    standardStartTime?: string;
    standardEndTime?: string;

    days: Record<string, GridDayDto>;
}

export interface AttendanceGridResponseDto {
    fromDate: string;
    toDate: string;
    totalWorkingDays: number;
    rows: EmployeeGridRowDto[];
}
export interface EmployeeFinanceTransactionDto {
    id: number;
    transactionDate: string;
    amount: number;
    type: string;
    description?: string;
}
export interface FinanceStatsDto {
    currentBalance: number;
    totalTakenInPeriod: number;
    transactions: EmployeeFinanceTransactionDto[];
}
export interface DailyAttendanceDetailDto {
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    shortcomingMinutes: number;
    overtimeMinutes: number;
    workingMinutes: number;
}
export interface EmployeeExtendedDetailDto {
    fromDate: string;
    toDate: string;

    employeeId: number;
    fullName: string;
    position: string;
    departmentName: string;
    baseSalary: number;
    salaryType: string;

    totalLateMinutes: number;
    totalEarlyLeaveMinutes: number;
    totalShortcomingMinutes: number;
    totalOvertimeMinutes: number;
    totalWorkedMinutes: number;

    days: DailyAttendanceDetailDto[];
    finance: FinanceStatsDto;
}