/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Subject, Task, StudyLog, AppState, Priority } from './types';
import { loadAppState, saveAppState, getLocalDateString } from './utils';
import Dashboard from './components/Dashboard';
import PomodoroTimer from './components/PomodoroTimer';
import SubjectManager from './components/SubjectManager';
import TaskPlanner from './components/TaskPlanner';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('study_planner_theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    // Fallback to media query
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Track page theme updates
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('study_planner_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('study_planner_theme', 'light');
    }
  }, [isDarkMode]);

  // Synchronize with local storage on state shifts
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Handler: Log Pomodoro studied minutes
  const handleLogStudySession = (subjectId: string, minutes: number) => {
    const newLog: StudyLog = {
      id: `log-${Date.now()}`,
      subjectId,
      date: getLocalDateString(new Date()),
      durationMinutes: minutes,
      createdAt: Date.now()
    };
    
    setAppState((prev) => ({
      ...prev,
      studyLogs: [...prev.studyLogs, newLog]
    }));
  };

  // Handler: Add course subject
  const handleAddSubject = (name: string, color: string) => {
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name,
      color,
      createdAt: Date.now()
    };

    setAppState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub]
    }));
  };

  // Handler: Edit course credentials
  const handleEditSubject = (id: string, name: string, color: string) => {
    setAppState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => 
        sub.id === id ? { ...sub, name, color } : sub
      )
    }));
  };

  // Handler: Safe Subject deletion
  const handleDeleteSubject = (id: string) => {
    setAppState((prev) => {
      // Re-route deleted subjects tasks and logs to 'misc' so historical aggregations don't crash
      const updatedTasks = prev.tasks.map((task) => 
        task.subjectId === id ? { ...task, subjectId: 'misc' } : task
      );
      
      const updatedLogs = prev.studyLogs.map((log) => 
        log.subjectId === id ? { ...log, subjectId: 'misc' } : log
      );

      return {
        ...prev,
        subjects: prev.subjects.filter((sub) => sub.id !== id),
        tasks: updatedTasks,
        studyLogs: updatedLogs
      };
    });
  };

  // Handler: Add scheduler task
  const handleAddTask = (name: string, subjectId: string, priority: Priority, deadline: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name,
      subjectId,
      priority,
      deadline,
      completed: false,
      createdAt: Date.now()
    };

    setAppState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  // Handler: Toggle checkbox task
  const handleToggleTask = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  // Handler: Remove scheduler task
  const handleDeleteTask = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-305 flex flex-col font-sans" id="app_root_layout">
      {/* Decorative gradient accents (Background ambient mesh rings) */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
      {/* Dynamic blurred radial spots */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Modern High-contrast Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-all" id="app_navigation_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="font-display font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Study Planner
              </span>
              <span className="hidden sm:inline-block text-[10px] ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-505/10">
                HABITS ENGINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Ambient Tip banner for headers */}
            <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <Sparkles size={12} className="text-purple-500" />
              <span>Perfect day to achieve study milestones!</span>
            </span>

            {/* Accent Dark Mode Toggle Button */}
            <button
              id="theme_master_toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-95"
              aria-label="Toggle visual theme"
              title="Toggle theme mode"
            >
              {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Core Layout stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 md:space-y-8 z-10">
        {/* Module 1: Greeting & Interactive Statistics Dashboard */}
        <Dashboard
          subjects={appState.subjects}
          tasks={appState.tasks}
          studyLogs={appState.studyLogs}
        />

        {/* Module 2: Active Tools split viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start" id="tools_split_viewport">
          {/* Main Focus Sprints & Task lists (Left side, takes 7 columns in desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            {/* Interactive Focus space (Pomodoro integration with study courses link) */}
            <PomodoroTimer
              subjects={appState.subjects}
              onLogStudySession={handleLogStudySession}
            />

            {/* Checklist Agenda Scheduler */}
            <TaskPlanner
              tasks={appState.tasks}
              subjects={appState.subjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* Academic subject metadata manager (Right side, takes 5 columns in desktop) */}
          <div className="lg:col-span-5">
            <SubjectManager
              subjects={appState.subjects}
              studyLogs={appState.studyLogs}
              onAddSubject={handleAddSubject}
              onEditSubject={handleEditSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 py-5 transition-all text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Study Planner Habits. Optimized for Student Achievement.</p>
          <div className="flex gap-4">
            <span className="hover:text-purple-650 cursor-help">Pomodoro Principle</span>
            <span className="hover:text-purple-650 cursor-help">Weekly Auditing</span>
            <span className="hover:text-purple-650 cursor-help">Active Recall</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
