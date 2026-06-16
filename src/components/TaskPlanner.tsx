/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Check, Square, Trash2, Calendar, AlertTriangle, ArrowUpDown, Filter, ChevronDown, CheckSquare, Sparkles } from 'lucide-react';
import { Task, Subject, Priority } from '../types';
import { getLocalDateString, getSubjectColorClasses } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface TaskPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (name: string, subjectId: string, priority: Priority, deadline: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskPlanner({
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskPlannerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('misc');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState(getLocalDateString(new Date()));

  // Filter systems
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'deadline' | 'priority' | 'createdAt'>('deadline');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    onAddTask(taskName.trim(), selectedSubjectId, priority, deadline);
    setTaskName('');
    setPriority('medium');
    // Set default subject
    setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : 'misc');
    setShowAddForm(false);
  };

  // Maps priority to score for sorting
  const priorityScore = (p: Priority): number => {
    switch (p) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  // Helper to pre-select subject when opening add form
  const handleOpenAddForm = () => {
    if (subjects.length > 0 && selectedSubjectId === 'misc') {
      setSelectedSubjectId(subjects[0].id);
    }
    setShowAddForm(!showAddForm);
  };

  // Format dates beautifully
  const formatDeadline = (dateStr: string) => {
    const today = getLocalDateString(new Date());
    const tomorrow = getLocalDateString(new Date(Date.now() + 86400000));
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    if (dateStr === yesterday) return 'Yesterday';

    try {
      const parts = dateStr.split('-');
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filtered and sorted tasks
  const filteredTasks = tasks
    .filter((task) => {
      // 1. Completion/Status Filter
      if (statusFilter === 'pending') return !task.completed;
      if (statusFilter === 'completed') return task.completed;
      return true;
    })
    .filter((task) => {
      // 2. Subject Filter
      if (subjectFilter === 'all') return true;
      return task.subjectId === subjectFilter;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortField === 'deadline') {
        return a.deadline.localeCompare(b.deadline);
      }
      if (sortField === 'priority') {
        return priorityScore(b.priority) - priorityScore(a.priority);
      }
      return b.createdAt - a.createdAt; // default recent
    });

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-xl border border-blue-500/10 dark:border-purple-500/10 transition-colors duration-300" id="task_planner_card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            Study Planner & Tasks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize daily lectures, exercise sets, and projects
          </p>
        </div>
        
        <button
          id="toggle_task_form_btn"
          onClick={handleOpenAddForm}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-xs font-semibold hover:opacity-95 shadow-sm transition-all duration-300 transform active:scale-95 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>{showAddForm ? 'Close Scheduler' : 'Add Task'}</span>
        </button>
      </div>

      {/* Task input drawer */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-6 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 space-y-4"
            id="add_task_form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="task_name_input" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Task Title
                </label>
                <input
                  id="task_name_input"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Read Physics Chapter 3, Draft essay outlines"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="task_subject_select" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Associated Course
                </label>
                <select
                  id="task_subject_select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                  <option value="misc">Miscellaneous Tasks</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Priority Level</span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                    const isSelected = priority === p;
                    const styles = {
                      low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                      medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                      high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                    }[p];

                    const activeBg = {
                      low: 'bg-blue-500 text-white border-blue-500',
                      medium: 'bg-amber-500 text-white border-amber-500',
                      high: 'bg-rose-500 text-white border-rose-500',
                    }[p];

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all duration-300 ${isSelected ? activeBg : styles} hover:scale-[1.02]`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="task_deadline" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Completion Deadline
                </label>
                <div className="relative">
                  <input
                    id="task_deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit_task_btn"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-95"
              >
                Schedule Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl mb-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <button
            onClick={() => setStatusFilter('all')}
            id="filter_status_all"
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'hover:bg-slate-250 dark:hover:bg-slate-800/80'
            }`}
          >
            All Goals ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            id="filter_status_pending"
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'hover:bg-slate-250 dark:hover:bg-slate-800/80'
            }`}
          >
            Pending ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            id="filter_status_completed"
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'hover:bg-slate-250 dark:hover:bg-slate-800/80'
            }`}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        {/* Detailed Dropdown filters */}
        <div className="flex items-center gap-3">
          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-slate-400" />
            <select
              value={subjectFilter}
              id="task_subject_filter_select"
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent font-medium border-none py-0.5 pr-4 pl-1 outline-none text-slate-600 dark:text-slate-350 focus:ring-0 cursor-pointer"
            >
              <option value="all">Every Course</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
              <option value="misc">Miscellaneous</option>
            </select>
          </div>

          {/* Sorter Selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown size={12} className="text-slate-400" />
            <select
              value={sortField}
              id="task_sorting_select"
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-transparent font-medium border-none py-0.5 pr-4 pl-1 outline-none text-slate-600 dark:text-slate-350 focus:ring-0 cursor-pointer"
            >
              <option value="deadline">By Deadline</option>
              <option value="priority">By Priority</option>
              <option value="createdAt">By Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List container */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/10">
          <CheckSquare className="text-slate-300 dark:text-slate-600 mb-2.5" size={32} />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching tasks found</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]">
            {tasks.length === 0
              ? 'Draft study goals using the "Add Task" action to schedule your coursework.'
              : 'Try altering your filters to fetch and manage scheduled study tasks.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5" id="task_list_items_container">
          <AnimatePresence initial={false}>
            {filteredTasks.map((task) => {
              const matchedSubject = subjects.find((s) => s.id === task.subjectId);
              const colorConfig = matchedSubject ? getSubjectColorClasses(matchedSubject.color) : null;
              
              const priorityStyles = {
                high: 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20',
                medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20',
                low: 'bg-blue-500/10 text-blue-600 dark:text-blue-450 border-blue-500/20',
              }[task.priority];

              // Check if past deadline for pending items
              const isOverdue = !task.completed && task.deadline < getLocalDateString(new Date());

              return (
                <motion.div
                  key={task.id}
                  id={`task_item_${task.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/60 opacity-65'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      id={`checkbox_toggle_${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      className={`p-1 rounded-lg transition-colors focus:outline-none ${
                        task.completed
                          ? 'text-purple-650 dark:text-purple-400 bg-purple-500/5'
                          : 'text-slate-350 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400'
                      }`}
                    >
                      {task.completed ? (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded p-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-[18px] h-[18px] rounded border-2 border-slate-300 dark:border-slate-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-normal truncate ${
                          task.completed
                            ? 'text-slate-400 dark:text-slate-500 line-through'
                            : 'text-slate-750 dark:text-slate-100'
                        }`}
                      >
                        {task.name}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-slate-450 dark:text-slate-450">
                        {/* Course metadata */}
                        {matchedSubject ? (
                          <span className={`px-1.5 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-350 border ${colorConfig?.border}`}>
                            {matchedSubject.name}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800">
                            Miscellaneous
                          </span>
                        )}

                        {/* Deadline metadata */}
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border border-transparent font-medium ${
                          isOverdue 
                            ? 'bg-rose-500/5 text-rose-500 font-semibold border-rose-500/10' 
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                        }`}>
                          <Calendar size={10} />
                          <span>{formatDeadline(task.deadline)}</span>
                          {isOverdue && <span className="uppercase text-[8px] font-bold">Overdue</span>}
                        </span>

                        {/* Priority tag */}
                        <span className={`px-1.5 py-0.5 rounded font-bold capitalize border ${priorityStyles}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`delete_task_${task.id}`}
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 rounded-lg opacity-0 hover:opacity-100 focus:opacity-100 md:group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                    title="Remove Task"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
