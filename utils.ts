import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isFuture, 
  isToday, 
  subDays,
  parseISO,
  isBefore,
  startOfWeek,
  endOfWeek,
  differenceInCalendarDays
} from 'date-fns';
import { Task, DayStatus, Stats } from './types';
import { XP_PER_COMPLETION, LEVEL_CONSTANT } from './constants';

export const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export const getMonthDays = (currentDate: Date): Date[] => {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  return eachDayOfInterval({ start, end });
};

export const getDayStatus = (date: Date, task: Task): DayStatus['status'] => {
  const dateKey = formatDateKey(date);
  const isCompleted = !!task.completedDates[dateKey];
  
  if (isFuture(date)) return 'future';
  
  // Previous logic checked task.createdAt here. 
  // We removed it to allow backfilling and to show past days as "missed" (red) 
  // for the current month view, regardless of when the task was added.

  if (isToday(date)) {
    return isCompleted ? 'completed' : 'today-pending';
  }

  return isCompleted ? 'completed' : 'missed';
};

export const calculateStats = (task: Task): Stats => {
  const dates = Object.keys(task.completedDates).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let totalCompleted = dates.length;

  // 1. Calculate Current Streak
  const today = new Date();
  const yesterday = subDays(today, 1);
  const todayKey = formatDateKey(today);
  const yesterdayKey = formatDateKey(yesterday);

  if (task.completedDates[todayKey]) {
    currentStreak = 1;
    let checkDate = subDays(today, 1);
    while (task.completedDates[formatDateKey(checkDate)]) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (task.completedDates[yesterdayKey]) {
    currentStreak = 1;
    let checkDate = subDays(yesterday, 1);
    while (task.completedDates[formatDateKey(checkDate)]) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else {
    currentStreak = 0;
  }

  // 2. Calculate Longest Streak (Historical)
  if (dates.length > 0) {
    let currentSequence = 1;
    let maxSequence = 1;
    
    // Sort dates purely as strings first (YYYY-MM-DD works for string sort)
    // Then convert to Date objects for diffing
    const sortedDateObjs = dates.sort().map(d => parseISO(d));

    for (let i = 1; i < sortedDateObjs.length; i++) {
      const prev = sortedDateObjs[i-1];
      const curr = sortedDateObjs[i];
      const diff = differenceInCalendarDays(curr, prev);

      if (diff === 1) {
        currentSequence++;
      } else if (diff > 1) {
        // Break in streak
        currentSequence = 1;
      }
      // If diff === 0 (duplicate), do nothing, keep sequence

      if (currentSequence > maxSequence) {
        maxSequence = currentSequence;
      }
    }
    longestStreak = maxSequence;
  }

  // XP Calculation
  // Formula: (Total Completed * 10) + (Bonus for streaks - simple approximation)
  const xp = totalCompleted * XP_PER_COMPLETION;
  
  // Level = Floor(SquareRoot(XP / 10)) - simple curve
  const level = Math.floor(Math.sqrt(xp / 10)) + 1;
  
  // Progress to next level logic
  const getXpForLevel = (l: number) => Math.floor(LEVEL_CONSTANT * Math.pow(l, 1.5));
  
  const calculatedLevel = (() => {
    let l = 1;
    while (xp >= getXpForLevel(l)) {
      l++;
    }
    return l;
  })();

  const xpCurrentLevel = getXpForLevel(calculatedLevel - 1);
  const xpNextLevel = getXpForLevel(calculatedLevel);
  const progressToNextLevel = ((xp - xpCurrentLevel) / (xpNextLevel - xpCurrentLevel)) * 100;

  return {
    currentStreak,
    longestStreak,
    totalCompleted,
    level: calculatedLevel,
    progressToNextLevel: Math.min(Math.max(progressToNextLevel, 0), 100),
    xp
  };
};

export const getWeeklyCompletionData = (tasks: Task[]) => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(today, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return days.map(day => {
    const dateKey = formatDateKey(day);
    let completedCount = 0;
    tasks.forEach(task => {
      // Only count if task existed on that day
      const createdKey = formatDateKey(new Date(task.createdAt));
      if (dateKey >= createdKey && task.completedDates[dateKey]) {
        completedCount++;
      }
    });

    return {
      day: format(day, 'EEE'), // Mon, Tue, etc.
      completed: completedCount,
      total: tasks.filter(t => formatDateKey(new Date(t.createdAt)) <= dateKey).length
    };
  });
};