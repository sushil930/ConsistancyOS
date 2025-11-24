import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import CalendarGrid from './CalendarGrid';
import { calculateStats, formatDateKey } from '../utils';
import { Trophy, Flame, Target, Award, Star } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
}

const BADGES = [
  { days: 7, label: '7 Day Streak', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { days: 30, label: '30 Day Streak', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { days: 90, label: '90 Day Streak', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
];

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Local state for buffered editing
  const [notes, setNotes] = useState(task.notes);
  const [title, setTitle] = useState(task.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setNotes(task.notes);
    setTitle(task.title);
  }, [task.id, task.notes, task.title]);

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      onUpdateTask({ ...task, notes });
    }
  };

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
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0"> {/* min-w-0 required for truncate to work in flex child */}
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              className="text-3xl font-bold text-text mb-2 bg-white outline-none border-b-2 border-highlight w-full transition-colors rounded-sm px-1 -ml-1 shadow-sm"
              aria-label="Edit task title"
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-3xl font-bold text-text mb-2 border-b-2 border-transparent hover:border-border cursor-text w-full transition-colors rounded-sm px-1 -ml-1 truncate"
              title="Click to edit"
            >
              {task.title}
            </h1>
          )}
          <p className="text-muted text-sm px-1">Created on {new Date(task.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-4 shrink-0">
          <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-2 shadow-sm">
            <Flame className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Streak</p>
              <p className="font-bold text-lg leading-none">{stats.currentStreak} Days</p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2 shadow-sm">
            <Trophy className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Level {stats.level}</p>
              <div className="w-16 h-2 bg-blue-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.progressToNextLevel}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <CalendarGrid 
            task={task} 
            currentDate={currentDate} 
            onToggleDate={handleToggleDate} 
          />
        </div>

        {/* Right Column: Stats & Notes */}
        <div className="space-y-6">
          {/* Stats Box */}
          <div className="bg-panel rounded-lg p-6 border border-border shadow-sm">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-muted" />
              Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted">Total Completions</span>
                <span className="font-medium text-text">{stats.totalCompleted}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted">Longest Streak</span>
                <span className="font-medium text-text">{stats.longestStreak}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted">Total XP</span>
                <span className="font-medium text-text">{stats.xp}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted">Completion Rate</span>
                <span className="font-medium text-text">
                  {stats.totalCompleted > 0 ? Math.round((stats.totalCompleted / ((new Date().getTime() - task.createdAt) / (1000 * 60 * 60 * 24) + 1)) * 100) : 0}%
                </span>
              </div>

              {/* Badges Section */}
              <div className="pt-4 mt-2 border-t border-border">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Achievements</h4>
                <div className="flex gap-2">
                  {BADGES.map((badge) => {
                    const isUnlocked = stats.longestStreak >= badge.days;
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={badge.days}
                        title={isUnlocked ? `Unlocked: ${badge.label}` : `Reach ${badge.days} day streak to unlock`}
                        className={`
                          group relative flex items-center justify-center p-3 rounded-md border transition-all duration-300
                          ${isUnlocked ? `${badge.bg} ${badge.border} ${badge.color}` : 'bg-gray-50 border-gray-100 text-gray-300 grayscale'}
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        
                        {/* Tooltip for locked state */}
                        {!isUnlocked && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {badge.days} Days
                          </div>
                        )}
                        
                        {/* Checkmark for unlocked */}
                        {isUnlocked && (
                           <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white flex items-center justify-center">
                             <div className="w-1.5 h-1.5 bg-white rounded-full" />
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mini Notes */}
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
             <div className="p-3 bg-panel border-b border-border">
               <h4 className="text-sm font-semibold text-muted">Mini Notes</h4>
             </div>
             <textarea 
               className="w-full h-48 p-4 text-sm text-text bg-transparent outline-none resize-none"
               placeholder="Jot down thoughts, motivations, or reasons for skipping..."
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               onBlur={handleNotesBlur}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;