/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high';

export interface Subject {
  id: string;
  name: string;
  color: string; // e.g., 'blue', 'indigo', 'purple', 'pink', 'emerald', 'amber'
  createdAt: number;
}

export interface Task {
  id: string;
  name: string;
  subjectId: string; // ID of the subject, or 'misc'
  priority: Priority;
  deadline: string; // YYYY-MM-DD format
  completed: boolean;
  createdAt: number;
}

export interface StudyLog {
  id: string;
  subjectId: string; // ID of the subject, or 'misc'
  date: string; // YYYY-MM-DD
  durationMinutes: number; // study duration in minutes
  createdAt: number;
}

export interface AppState {
  subjects: Subject[];
  tasks: Task[];
  studyLogs: StudyLog[];
}
