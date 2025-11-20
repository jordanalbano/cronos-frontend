export type MonthlyClosureStatus = 'open' | 'reviewing' | 'closed';
export type EmployeeClosureStatus = 'normal' | 'exceeded';

export interface MonthlyClosure {
  id: string;
  month: number;
  year: number;
  status: MonthlyClosureStatus;
  totalHours: number;
  totalExceededHours: number;
  totalEmployees: number;
  employeesExceeded: number;
  allowedMonthlyHours: number;
  notes?: string;
  closedAt?: Date;
  closedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyClosureDetail {
  id: string;
  closureId: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalMonthlyHours: number;
  allowedHours: number;
  exceededHours: number;
  totalClockings: number;
  status: EmployeeClosureStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyClosurePreview {
  month: number;
  year: number;
  totalHours: number;
  totalExceededHours: number;
  totalEmployees: number;
  employeesExceeded: number;
  allowedMonthlyHours: number;
  details: MonthlyClosurePreviewDetail[];
  hasInProgressClockings: boolean;
  inProgressClockingsCount: number;
}

export interface MonthlyClosurePreviewDetail {
  userId: string;
  userName: string;
  userEmail: string;
  totalMonthlyHours: number;
  allowedHours: number;
  exceededHours: number;
  totalClockings: number;
  status: EmployeeClosureStatus;
}

export interface MonthlyClosureFilters {
  year?: number;
  status?: MonthlyClosureStatus;
  userId?: string;
}

export interface MonthlyClosureSummary {
  totalClosures: number;
  totalHoursClosed: number;
  totalExceededHoursClosed: number;
  averageExceededPerMonth: number;
  lastClosure?: MonthlyClosure;
}

export interface MonthlyClosureWithDetails extends MonthlyClosure {
  details: MonthlyClosureDetail[];
}
