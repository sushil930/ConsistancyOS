import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskDetail from './components/TaskDetail';
import Dashboard from './components/Dashboard';
import AchievementModal, { Achievement } from './components/AchievementModal';
import { Task } from './types';
import { calculateStats } from './utils';
import { Menu, Trophy, Star, Zap, Award, Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'consistency-os-v1-data';
const THEME_KEY = 'consistency-os-theme';

const ACHIEVEMENTS_DATA: Record<string, Omit<Achievement, 'id'>> = {
  'streak-7': {
    title: '7 Day Streak!',
    description: 'You have maintained a 7-day streak. Keep it up!',
    icon: Flame,
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  'streak-30': {
    title: '30 Day Streak!',
    description: 'Incredible! 30 days of consistency. You are unstoppable!',
    icon: Star,
    color: 'text-yellow-500 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  'xp-100': {
    title: '100 XP Gained!',
    description: 'You have earned 100 XP on this habit. Great progress!',
    icon: Zap,
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  }
};

import { Flame } from 'lucide-react'; // Import Flame separately as it was used in ACHIEVEMENTS_DATA before import

const App: React.FC = () => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // --- Handlers ---
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      notes: '',
      createdAt: Date.now(),
      completedDates: {}
    };
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskId(newTask.id); // Auto select new task
  };

  const handleUpdateTask = (updatedTask: Task) => {
    // Check for achievements
    const stats = calculateStats(updatedTask);
    const newAchievements: string[] = updatedTask.achievements ? [...updatedTask.achievements] : [];
    let achievementToShow: Achievement | null = null;

    // Check 7-day streak
    if (stats.currentStreak >= 7 && !newAchievements.includes('streak-7')) {
      newAchievements.push('streak-7');
      achievementToShow = { id: 'streak-7', ...ACHIEVEMENTS_DATA['streak-7'] };
    }

    // Check 30-day streak
    if (stats.currentStreak >= 30 && !newAchievements.includes('streak-30')) {
      newAchievements.push('streak-30');
      achievementToShow = { id: 'streak-30', ...ACHIEVEMENTS_DATA['streak-30'] };
    }

    // Check 100 XP
    if (stats.xp >= 100 && !newAchievements.includes('xp-100')) {
      newAchievements.push('xp-100');
      // Prioritize higher achievements or show the last one? 
      // If multiple unlock at once, we might miss one. 
      // For simplicity, show the last one unlocked or prioritize streak.
      // Let's just overwrite for now, usually they don't happen exactly at same click unless bulk update.
      achievementToShow = { id: 'xp-100', ...ACHIEVEMENTS_DATA['xp-100'] };
    }

    const taskWithAchievements = { ...updatedTask, achievements: newAchievements };
    
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? taskWithAchievements : t));

    if (achievementToShow) {
      setCurrentAchievement(achievementToShow);
    }
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this habit? All progress will be lost.')) {
      // If the task being deleted is currently selected, deselect it immediately
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
      
      // Update tasks state
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- Derivations ---
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive visibility */}
      <div className={`
        fixed md:relative z-30 h-full
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={(id) => {
            setSelectedTaskId(id);
            setIsSidebarOpen(false);
          }}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-muted">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold ml-2">Consistency OS</span>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-muted hover:text-text transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTask ? (
            <TaskDetail 
              task={selectedTask} 
              onUpdateTask={handleUpdateTask} 
            />
          ) : (
            <Dashboard tasks={tasks} onUpdateTask={handleUpdateTask} />
          )}
        </div>
      </main>

      <AchievementModal 
        isOpen={!!currentAchievement} 
        onClose={() => setCurrentAchievement(null)} 
        achievement={currentAchievement} 
      />
    </div>
  );
};

export default App;