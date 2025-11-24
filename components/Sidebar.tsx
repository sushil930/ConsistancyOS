import React, { useState } from 'react';
import { Plus, Trash2, Zap, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { Task } from '../types';
import { formatDateKey } from '../utils';

interface SidebarProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string | null) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  tasks, 
  selectedTaskId, 
  onSelectTask, 
  onAddTask,
  onDeleteTask,
  darkMode,
  toggleDarkMode
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const todayKey = formatDateKey(new Date());

  return (
    <aside className="w-full md:w-64 bg-panel border-r border-border h-screen flex flex-col shrink-0 transition-all duration-300">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl text-text mb-1">
          <Zap className="w-6 h-6 text-highlight" />
          <span>Consistency</span>
        </div>
        <p className="text-xs text-muted uppercase tracking-wider">Operating System v1</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Dashboard Link */}
        <button
          onClick={() => onSelectTask(null)}
          className={`w-full flex items-center gap-3 p-3 rounded-md transition-all duration-200 mb-6 ${
            selectedTaskId === null 
              ? 'bg-background shadow-subtle text-text ring-1 ring-border' 
              : 'text-muted hover:bg-border/30 hover:text-text'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-2">
          Habits
        </div>
        
        {tasks.map(task => {
          // Calculate if completed today for the indicator dot
          const isCompletedToday = !!task.completedDates[todayKey];
          const isSelected = selectedTaskId === task.id;
          
          return (
            <div
              key={task.id}
              className={`w-full group flex items-center justify-between rounded-md transition-all duration-200 ${
                isSelected 
                  ? 'bg-background shadow-subtle text-text ring-1 ring-border' 
                  : 'text-muted hover:bg-border/30 hover:text-text'
              }`}
            >
              {/* Selection Area - Sibling 1 */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectTask(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTask(task.id);
                  }
                }}
                className="flex-1 text-left p-3 flex items-center gap-3 overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-highlight/50 rounded-l-md"
              >
                <div 
                  title={isCompletedToday ? "Completed today" : "Pending"}
                  className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${isCompletedToday ? 'bg-success' : 'bg-border'}`} 
                />
                <span className="truncate font-medium">{task.title}</span>
              </div>
              
              {/* Delete Action - Sibling 2 */}
              <button 
                type="button"
                onClick={(e) => {
                   // Critical: Stop propagation to prevent triggering the selection click
                   e.stopPropagation();
                   onDeleteTask(task.id, e);
                }}
                className="mr-2 p-2 text-gray-300 hover:text-error hover:bg-red-50 rounded-md transition-colors duration-200 shrink-0 outline-none focus:ring-2 focus:ring-error/50 opacity-100"
                aria-label={`Delete ${task.title}`}
                title="Delete habit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {isAdding ? (
          <form onSubmit={handleSubmit} className="mt-2 p-2">
            <input
              autoFocus
              type="text"
              className="w-full p-2 text-sm border border-highlight rounded-md outline-none bg-white shadow-sm"
              placeholder="Habit name..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => !newTaskTitle && setIsAdding(false)}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2 p-3 text-muted hover:text-text hover:bg-gray-100 rounded-md transition-colors text-sm font-medium mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Habit</span>
          </button>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{tasks.length} Active Habits</span>
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 rounded-md text-muted hover:text-text hover:bg-border/50 transition-colors"
            aria-label="Toggle dark mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;