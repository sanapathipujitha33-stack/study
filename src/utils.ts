/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, Task, StudyLog, AppState } from './types';

// Helper to get raw date string format YYYY-MM-DD
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate past relative dates dynamically for seeding logs
function getOffsetDateString(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return getLocalDateString(date);
}

// Get the local day name for a relative offset
export function getDayName(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Load current week data mapping from Monday to Sunday for logs chart
export interface WeeklyChartData {
  dayName: string;
  dateStr: string;
  hours: number;
}

export function getWeeklyChartData(logs: StudyLog[]): WeeklyChartData[] {
  const chartData: WeeklyChartData[] = [];
  
  // Create last 7 days starting from 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    const dateStr = getOffsetDateString(i);
    const dayName = getDayName(i);
    
    // Sum logs for this date
    const dayMinutes = logs
      .filter((log) => log.date === dateStr)
      .reduce((sum, log) => sum + log.durationMinutes, 0);
      
    chartData.push({
      dayName,
      dateStr,
      hours: parseFloat((dayMinutes / 60).toFixed(1)),
    });
  }
  
  return chartData;
}

export function getSubjectStudyHours(subjectId: string, logs: StudyLog[]): number {
  const minutes = logs
    .filter((log) => log.subjectId === subjectId)
    .reduce((sum, log) => sum + log.durationMinutes, 0);
  return parseFloat((minutes / 60).toFixed(1));
}

// Color utility definitions for subjects
export const SUBJECT_COLORS = [
  { value: 'blue', label: 'Sky Blue', bg: 'bg-blue-500/10 hover:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', fill: 'bg-blue-500' },
  { value: 'purple', label: 'Amethyst', bg: 'bg-purple-500/10 hover:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', fill: 'bg-purple-500' },
  { value: 'indigo', label: 'Indigo Peak', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20', fill: 'bg-indigo-500' },
  { value: 'pink', label: 'Cosmic Pink', bg: 'bg-pink-500/10 hover:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20', fill: 'bg-pink-500' },
  { value: 'emerald', label: 'Aurora Green', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', fill: 'bg-emerald-500' },
  { value: 'amber', label: 'Solar Amber', bg: 'bg-amber-500/10 hover:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', fill: 'bg-amber-500' },
];

export function getSubjectColorClasses(colorName: string) {
  const found = SUBJECT_COLORS.find((c) => c.value === colorName);
  return found || SUBJECT_COLORS[2]; // Default to indigo
}

// Initial default data for a brand-new user session
const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-calculus', name: 'Mathematics II', color: 'indigo', createdAt: Date.now() },
  { id: 'sub-databases', name: 'Computer Science', color: 'purple', createdAt: Date.now() - 1000 * 60 * 5 },
  { id: 'sub-quantum', name: 'Quantum Physics', color: 'blue', createdAt: Date.now() - 1000 * 60 * 10 },
  { id: 'sub-lit', name: 'English Literature', color: 'pink', createdAt: Date.now() - 1000 * 60 * 15 }
];

const DEFAULT_TASKS = (subjects: Subject[]): Task[] => [
  {
    id: 'task-1',
    name: 'Complete Calculus Assignment 4',
    subjectId: 'sub-calculus',
    priority: 'high',
    deadline: getOffsetDateString(-2), // 2 days ago
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: 'task-2',
    name: 'Revise Database SQL Queries',
    subjectId: 'sub-databases',
    priority: 'medium',
    deadline: getOffsetDateString(0), // Today
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'task-3',
    name: 'Lab Report on Quantum Tunneling',
    subjectId: 'sub-quantum',
    priority: 'high',
    deadline: getOffsetDateString(3), // In 3 days
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 'task-4',
    name: 'Read Chapters 4-6 of Great Gatsby',
    subjectId: 'sub-lit',
    priority: 'low',
    deadline: getOffsetDateString(1), // Tomorrow
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  }
];

const DEFAULT_LOGS: StudyLog[] = [
  // Generate logs for the last 5 days
  { id: 'log-1', subjectId: 'sub-calculus', date: getOffsetDateString(4), durationMinutes: 90, createdAt: Date.now() },
  { id: 'log-2', subjectId: 'sub-databases', date: getOffsetDateString(3), durationMinutes: 120, createdAt: Date.now() },
  { id: 'log-3', subjectId: 'sub-quantum', date: getOffsetDateString(2), durationMinutes: 60, createdAt: Date.now() },
  { id: 'log-4', subjectId: 'sub-lit', date: getOffsetDateString(1), durationMinutes: 45, createdAt: Date.now() },
  { id: 'log-5', subjectId: 'sub-calculus', date: getOffsetDateString(0), durationMinutes: 50, createdAt: Date.now() }, // Today
  { id: 'log-6', subjectId: 'sub-databases', date: getOffsetDateString(0), durationMinutes: 25, createdAt: Date.now() }, // Today
];

const STORAGE_KEY = 'study_planner_app_state';

export function loadAppState(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.subjects && parsed.tasks && parsed.studyLogs) {
        return parsed as AppState;
      }
    }
  } catch (error) {
    console.error('Failed to load state from LS:', error);
  }
  
  // Seed state
  const initial: AppState = {
    subjects: DEFAULT_SUBJECTS,
    tasks: DEFAULT_TASKS(DEFAULT_SUBJECTS),
    studyLogs: DEFAULT_LOGS
  };
  saveAppState(initial);
  return initial;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to LS:', error);
  }
}
