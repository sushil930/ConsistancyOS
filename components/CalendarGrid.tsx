import React from 'react';
import { format, isSameMonth } from 'date-fns';
import { Task } from '../types';
import { getMonthDays, getDayStatus } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarGridProps {
  task: Task;
  currentDate: Date;
  onToggleDate: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ task, currentDate, onToggleDate }) => {
  const days = getMonthDays(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-text">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded-sm"></div>
            <span className="text-muted">Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-error rounded-sm"></div>
            <span className="text-muted">Missed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map(day => {
          const status = getDayStatus(day, task);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          if (!isCurrentMonth) {
            return <div key={day.toISOString()} className="aspect-square" />;
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
              bgClass = 'bg-white';
              borderClass = 'border-2 border-highlight';
              break;
            case 'future':
              bgClass = 'bg-future';
              textClass = 'text-muted/50';
              cursorClass = 'cursor-default';
              break;
            case 'not-created':
              bgClass = 'bg-gray-100';
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
                aspect-square rounded-md flex flex-col items-center justify-center relative
                transition-colors duration-300
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
                  className={`text-sm font-medium ${textClass}`}
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