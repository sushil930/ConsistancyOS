import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskDetail from './components/TaskDetail';
import Dashboard from './components/Dashboard';
import { Task } from './types';
import { Menu } from 'lucide-react';

const STORAGE_KEY = 'consistency-os-v1-data';

const App: React.FC = () => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isLoaded, setIsLoaded] = useState(false);

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

  // --- Handlers ---
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
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
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
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-border bg-white">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-muted">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold ml-2">Consistency OS</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTask ? (
            <TaskDetail 
              task={selectedTask} 
              onUpdateTask={handleUpdateTask} 
            />
          ) : (
            <Dashboard tasks={tasks} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;