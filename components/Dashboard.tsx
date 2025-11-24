import React from 'react';
import { Task } from '../types';
import { calculateStats, getWeeklyCompletionData, formatDateKey } from '../utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const weeklyData = getWeeklyCompletionData(tasks);
  
  // Aggregate stats
  const totalXP = tasks.reduce((sum, t) => sum + calculateStats(t).xp, 0);
  const totalCompletions = tasks.reduce((sum, t) => sum + calculateStats(t).totalCompleted, 0);
  const activeStreaks = tasks.filter(t => calculateStats(t).currentStreak > 0).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-muted mt-1">Your consistency overview for this week.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-start justify-between">
          <div>
            <p className="text-muted text-sm font-medium uppercase tracking-wider">Total XP</p>
            <p className="text-3xl font-bold text-text mt-2">{totalXP}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-start justify-between">
          <div>
            <p className="text-muted text-sm font-medium uppercase tracking-wider">Active Streaks</p>
            <p className="text-3xl font-bold text-text mt-2">{activeStreaks}</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-start justify-between">
          <div>
            <p className="text-muted text-sm font-medium uppercase tracking-wider">Total Check-ins</p>
            <p className="text-3xl font-bold text-text mt-2">{totalCompletions}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-lg text-text mb-6">Weekly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg border border-border shadow-card text-xs">
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
                      <Cell key={`cell-${index}`} fill={entry.completed > 0 ? '#37B26C' : '#E5E5E5'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-lg text-text mb-6">Today's Focus</h3>
          <div className="space-y-4">
             {tasks.length === 0 && <p className="text-muted italic">No habits created yet.</p>}
             {tasks.slice(0, 5).map(task => {
                const todayKey = formatDateKey(new Date());
                const done = !!task.completedDates[todayKey];
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                     <span className={`${done ? 'line-through text-muted' : 'text-text'} font-medium`}>{task.title}</span>
                     <span className={`text-xs px-2 py-1 rounded-full ${done ? 'bg-success/10 text-success' : 'bg-gray-100 text-muted'}`}>
                       {done ? 'Done' : 'Pending'}
                     </span>
                  </div>
                )
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;