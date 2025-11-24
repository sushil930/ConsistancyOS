import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import CalendarGrid from './CalendarGrid';
import { calculateStats, formatDateKey } from '../utils';
import { Trophy, Flame, Target, Award, Star, Pencil, Check, X, Zap } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
}

const BADGES = [
  { days: 7, label: '7 Day Streak', icon: Award, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800' },
  { days: 30, label: '30 Day Streak', icon: Star, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-100 dark:border-yellow-800' },
  { days: 90, label: '90 Day Streak', icon: Trophy, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-800' },
];

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Local state for buffered editing
  const [title, setTitle] = useState(task.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setTitle(task.title);
  }, [task.id, task.title]);

  const saveTitle = () => {
    setIsEditingTitle(false);
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      onUpdateTask({ ...task, title: trimmedTitle });
    } else if (!trimmedTitle) {
      // Revert if empty
      setTitle(task.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleToggleDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const newCompletedDates = { ...task.completedDates };

    if (newCompletedDates[dateKey]) {
      delete newCompletedDates[dateKey];
    } else {
      newCompletedDates[dateKey] = true;
    }

    onUpdateTask({
      ...task,
      completedDates: newCompletedDates
    });
  };

  const stats = calculateStats(task);

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-3 animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="flex-1 min-w-0"> {/* min-w-0 required for truncate to work in flex child */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                className="text-2xl font-bold text-text bg-panel outline-none border-b-2 border-highlight flex-1 transition-colors rounded-sm p-1 -ml-1 shadow-sm"
                aria-label="Edit task title"
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={saveTitle}
                className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
                title="Save"
              >
                <Check className="w-6 h-6" />
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTitle(task.title);
                  setIsEditingTitle(false);
                }}
                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                title="Cancel"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group mb-1">
              <h1 
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl font-bold text-text border-b-2 border-transparent hover:border-border cursor-text transition-colors rounded-sm p-1 -ml-1 truncate"
                title="Click to edit"
              >
                {task.title}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-2 text-muted hover:text-text hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-highlight/50"
                aria-label="Rename task"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          )}
          <p className="text-muted text-xs px-1">Created on {new Date(task.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center gap-2 shadow-sm">
            <Flame className="w-4 h-4" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Streak</p>
              <p className="font-bold text-base leading-none">{stats.currentStreak} Days</p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2 shadow-sm">
            <Trophy className="w-4 h-4" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Level {stats.level}</p>
              <div className="w-16 h-1.5 bg-blue-200 rounded-full mt-0.5 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.progressToNextLevel}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 flex-shrink-0">
        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Current Streak</p>
            <p className="text-2xl font-bold text-text mt-1">{stats.currentStreak} <span className="text-sm font-normal text-muted">days</span></p>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
            <Flame className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Completion Rate</p>
            <p className="text-2xl font-bold text-text mt-1">{stats.completionRate}%</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-panel p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Total XP</p>
            <p className="text-2xl font-bold text-text mt-1">{stats.xp}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Calendar Section */}
        <div className="flex-1 bg-panel rounded-xl border border-border shadow-sm flex flex-col min-h-0 overflow-hidden">
          <CalendarGrid 
            task={task} 
            onToggleDate={handleToggleDate}
            currentDate={currentDate}
            onMonthChange={setCurrentDate}
          />
        </div>

        {/* Badges Section */}
        <div className="lg:w-80 bg-panel rounded-xl border border-border shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-border flex-shrink-0">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {BADGES.map((badge, index) => {
                const isUnlocked = stats.currentStreak >= badge.days;
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                      isUnlocked 
                        ? `${badge.bg} ${badge.border}` 
                        : 'bg-background border-border opacity-60 grayscale'
                    }`}
                  >
                    <div className={`p-2 rounded-full bg-panel shadow-sm ${isUnlocked ? badge.color : 'text-muted'}`}>
                      <badge.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${isUnlocked ? 'text-text' : 'text-muted'}`}>{badge.label}</p>
                      <p className="text-xs text-muted">{isUnlocked ? 'Unlocked!' : `${badge.days} day streak required`}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;