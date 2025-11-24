export interface Task {
  id: string;
  title: string;
  notes: string;
  createdAt: number; // Timestamp
  completedDates: Record<string, boolean>; // Key: YYYY-MM-DD
}

export interface DayStatus {
  date: Date;
  dateString: string; // YYYY-MM-DD
  status: 'completed' | 'missed' | 'today-pending' | 'future' | 'not-created';
}

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  level: number;
  progressToNextLevel: number;
  xp: number;
}
