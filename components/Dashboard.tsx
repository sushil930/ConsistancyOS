import React from 'react';
import { Task } from '../types';
import { calculateStats, getWeeklyCompletionData, formatDateKey } from '../utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, CheckCircle, TrendingUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onUpdateTask }) => {
  const weeklyData = getWeeklyCompletionData(tasks);
  const todayKey = formatDateKey(new Date());
  
  // Aggregate stats
  const totalXP = tasks.reduce((sum, t) => sum + calculateStats(t).xp, 0);
  const totalCompletions = tasks.reduce((sum, t) => sum + calculateStats(t).totalCompleted, 0);
  const activeStreaks = tasks.filter(t => calculateStats(t).currentStreak > 0).length;

  const handleToggleToday = (task: Task) => {
    const newCompletedDates = { ...task.completedDates };
    if (newCompletedDates[todayKey]) {
      delete newCompletedDates[todayKey];
    } else {
      newCompletedDates[todayKey] = true;
    }
    onUpdateTask({ ...task, completedDates: newCompletedDates });
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-3 overflow-hidden">
      <header className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-muted mt-0.5 text-sm">Your consistency overview for this week.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0 mb-3">
        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex items-start justify-between">
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Total XP</p>
            <p className="text-2xl font-bold text-text mt-1">{totalXP}</p>
          </div>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex items-start justify-between">
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Active Streaks</p>
            <p className="text-2xl font-bold text-text mt-1">{activeStreaks}</p>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex items-start justify-between">
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Total Check-ins</p>
            <p className="text-2xl font-bold text-text mt-1">{totalCompletions}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Today's Focus Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Weekly Performance Chart */}
        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex flex-col min-h-0">
          <h3 className="font-semibold text-base text-text mb-3">Weekly Performance</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-future)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-panel p-3 rounded-lg border border-border shadow-card text-xs">
                          <p className="font-bold text-text mb-2 border-b border-border/50 pb-1">{label}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4 items-center">
                              <span className="text-muted">Completed:</span>
                              <span className="font-bold text-success">{data.completed}</span>
                            </div>
                            <div className="flex justify-between gap-4 items-center">
                              <span className="text-muted">Total Habits:</span>
                              <span className="font-medium text-text">{data.total}</span>
                            </div>
                            {data.total > 0 && (
                              <div className="pt-1 mt-1 border-t border-border/50 flex justify-between gap-4">
                                <span className="text-muted text-[10px]">Rate:</span>
                                <span className="font-medium text-[10px] text-text">
                                  {Math.round((data.completed / data.total) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.completed > 0 ? 'var(--color-highlight)' : 'var(--color-border)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Focus Panel */}
        <div className="bg-panel rounded-xl border border-border shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex-shrink-0">
            <h3 className="font-semibold text-base text-text flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-highlight" />
              Today's Focus
            </h3>
            <p className="text-sm text-muted mt-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto min-h-0">
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <p className="text-base">No habits yet.</p>
                <p className="text-sm mt-1">Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task, index) => {
                    const isCompleted = !!task.completedDates[todayKey];
                    const stats = calculateStats(task);
                    
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { delay: index * 0.05 }
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          group relative flex items-center gap-2.5 p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden
                          ${isCompleted 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-sm' 
                            : 'bg-panel border-border hover:border-highlight hover:shadow-md'
                          }
                        `}
                        onClick={() => handleToggleToday(task)}
                      >
                        {/* Completion indicator animation */}
                        {isCompleted && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-800/30 dark:to-emerald-800/30"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        )}
                        
                        <motion.div 
                          className={`
                            relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${isCompleted 
                              ? 'bg-success border-success text-white shadow-lg' 
                              : 'border-border text-transparent group-hover:border-highlight group-hover:bg-highlight/10'
                            }
                          `}
                          whileHover={{ rotate: isCompleted ? 0 : 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0 relative">
                          <p className={`font-medium text-sm truncate transition-all duration-300 ${isCompleted ? 'text-green-800 dark:text-green-300 line-through' : 'text-text group-hover:text-highlight'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <motion.span 
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-all duration-300 ${isCompleted ? 'bg-success text-white' : 'bg-border/50 text-muted group-hover:bg-highlight/20 group-hover:text-highlight'}`}
                              layout
                            >
                              {isCompleted ? '✓ Completed' : 'Pending'}
                            </motion.span>
                            {stats.currentStreak > 0 && (
                              <motion.span 
                                className="text-[10px] font-medium text-orange-600 dark:text-orange-400 flex items-center gap-0.5 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              >
                                <Flame className="w-3 h-3" /> {stats.currentStreak}d
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;