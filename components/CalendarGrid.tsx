import React, { useState, useEffect } from 'react';
import { format, isSameMonth } from 'date-fns';
import { Task } from '../types';
import { getMonthDays, getDayStatus } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

interface CalendarGridProps {
  task: Task;
  currentDate: Date;
  onToggleDate: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ task, currentDate, onToggleDate, onMonthChange }) => {
  const [isCompact, setIsCompact] = useState(() => {
    const saved = localStorage.getItem('calendar-compact-mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('calendar-compact-mode', isCompact.toString());
  }, [isCompact]);

  const days = getMonthDays(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-panel rounded-lg border border-border p-4 shadow-sm transition-all duration-300 ${isCompact ? 'max-w-sm' : 'max-w-xl'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base text-text">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="p-1 text-muted hover:text-text hover:bg-border/50 rounded transition-colors"
            title={isCompact ? "Switch to Normal View" : "Switch to Compact View"}
          >
            {isCompact ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>
        <div className="flex gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-success rounded-sm"></div>
            <span className="text-muted">Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-error rounded-sm"></div>
            <span className="text-muted">Missed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-muted uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const status = getDayStatus(day, task);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          if (!isCurrentMonth) {
            return <div key={day.toISOString()} className={isCompact ? 'w-[48px] h-[48px]' : 'w-[72px] h-[72px]'} />;
          }

          let bgClass = '';
          let borderClass = '';
          let textClass = 'text-text';
          let cursorClass = 'cursor-pointer hover:opacity-80';

          switch (status) {
            case 'completed':
              bgClass = 'bg-success';
              textClass = 'text-white';
              break;
            case 'missed':
              bgClass = 'bg-error';
              textClass = 'text-white';
              break;
            case 'today-pending':
              bgClass = 'bg-panel';
              borderClass = 'border-2 border-highlight';
              break;
            case 'future':
              bgClass = 'bg-future';
              textClass = 'text-muted/50';
              cursorClass = 'cursor-default';
              break;
            case 'not-created':
              bgClass = 'bg-border/30';
              textClass = 'text-muted/30';
              cursorClass = 'cursor-default';
              break;
          }

          const isInteractable = status !== 'future' && status !== 'not-created';

          return (
            <motion.div
              key={day.toISOString()}
              layout
              whileTap={isInteractable ? { scale: 0.9 } : {}}
              animate={status === 'completed' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (isInteractable) {
                  onToggleDate(day);
                }
              }}
              className={`
                ${isCompact ? 'w-[48px] h-[48px]' : 'w-[72px] h-[72px]'}
                rounded-md flex flex-col items-center justify-center relative
                transition-all duration-300
                ${bgClass} ${borderClass} ${cursorClass}
              `}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${status}-${day.toISOString()}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`text-xs font-medium ${textClass}`}
                >
                  {format(day, 'd')}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;