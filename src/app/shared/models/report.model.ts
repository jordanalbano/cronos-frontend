export interface MonthlyReportItem {
    id: string;
    userId: string;
    userName: string;
    date: string; // ISO String
    totalHours: number;
    exceededHours: number;
    deductibleTime: number;
}
