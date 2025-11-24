import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement | null;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose, achievement }) => {
  useEffect(() => {
    if (isOpen) {
      // Optional: Play sound here
      // const audio = new Audio('/achievement.mp3');
      // audio.play().catch(e => console.log('Audio play failed', e));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && achievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="bg-panel rounded-2xl shadow-2xl border-2 border-yellow-100 dark:border-yellow-900/30 p-6 max-w-sm w-full pointer-events-auto relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className={`absolute top-0 left-0 w-full h-2 ${achievement.bgColor}`} />
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${achievement.bgColor} rounded-full opacity-10 blur-2xl`} />
            <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${achievement.bgColor} rounded-full opacity-10 blur-2xl`} />

            <button 
              onClick={onClose}
              className="absolute top-3 right-3 text-muted hover:text-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`w-20 h-20 rounded-full ${achievement.bgColor} flex items-center justify-center mb-4 shadow-inner`}
              >
                <achievement.icon className={`w-10 h-10 ${achievement.color}`} />
              </motion.div>

              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-text mb-1"
              >
                {achievement.title}
              </motion.h3>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted text-sm mb-6"
              >
                {achievement.description}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className={`px-6 py-2 rounded-full font-semibold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 bg-highlight`}
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AchievementModal;
