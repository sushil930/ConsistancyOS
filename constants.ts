import { Home, BarChart2, CheckSquare, Settings } from 'lucide-react';

export const XP_PER_COMPLETION = 10;
export const XP_STREAK_BONUS = 5; // Extra XP per day if streak > 3
export const LEVEL_CONSTANT = 100; // XP needed for level 1. Exponential scaling applies.

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'tasks', label: 'Habits', icon: CheckSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];
