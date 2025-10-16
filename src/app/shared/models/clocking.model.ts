export interface Clocking {
  id: string;
  userId: string;
  userName: string; // For display purposes
  startTime: string; // ISO string
  endTime: string | null; // ISO string
  description: string;
  status: 'in-progress' | 'completed';
}
