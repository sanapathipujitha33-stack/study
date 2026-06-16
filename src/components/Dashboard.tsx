/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Award, BookOpen, Clock, Edit2, Check, Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { Subject, Task, StudyLog } from '../types';
import { getWeeklyChartData } from '../utils';
import { motion } from 'motion/react';

interface DashboardProps {
  subjects: Subject[];
  tasks: Task[];
  studyLogs: StudyLog[];
}

const MOTIVATIONAL_TIPS = [
  "Space your learning out: Studying for 30 minutes daily for 5 days is vastly superior to a 2.5-hour cramming session.",
  "Implement active recall: Restate key concepts in your own words instead of re-reading highlighting lines.",
  "Adopt the Pomodoro technique: Focused 25-minute sprints help prevent continuous mental exhaustion.",
  "Pre-test yourself: Answering practice questions before revising improves retention up to 50%.",
  "Designate a distraction-free zone: Establish a rigid boundary reserved solely for studious focus.",
  "Sleep is part of study: Your brain consolidates learnings and moves facts to long-term memory during deep sleep."
];

export default function Dashboard({ subjects, tasks, studyLogs }: DashboardProps) {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('study_planner_username') || 'Scholar';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [greeting, setGreeting] = useState('Welcome');
  const [tipIndex, setTipIndex] = useState(0);

  // Determine dynamic greeting based on system hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Seed randomized study tip
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTipIndex(dayOfYear % MOTIVATIONAL_TIPS.length);
  }, []);

  const handleNameSave = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setUserName(trimmed);
      localStorage.setItem('study_planner_username', trimmed);
    }
    setIsEditingName(false);
  };

  // Calculations
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const totalTasks = tasks.length;
  const taskProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMinutes = studyLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalStudyHoursFormatted = parseFloat((totalMinutes / 60).toFixed(1));

  // Weekly stats
  const weeklyChartData = getWeeklyChartData(studyLogs);
  const maxWeeklyHours = Math.max(...weeklyChartData.map((d) => d.hours), 1); // Avoid division by zero

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6" id="dashboard_view">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-505 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6" id="welcome_banner">
        {/* Dynamic decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute -bottom-16 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-100" />
            <span className="text-xs md:text-sm font-semibold tracking-wide text-blue-100">{todayStr}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3.5xl font-display font-bold leading-tight">
              {greeting},
            </h1>

            {isEditingName ? (
              <div className="flex items-center bg-white/10 backdrop-blur rounded-xl px-2 py-0.5 border border-white/20">
                <input
                  type="text"
                  maxLength={15}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-transparent font-display text-2xl md:text-3xl font-bold text-white outline-none border-none py-0 w-36"
                  autoFocus
                />
                <button onClick={handleNameSave} className="p-1 hover:text-emerald-300 transition-colors">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="text-2xl md:text-3.5xl font-display font-black tracking-tight">{userName}!</span>
                <button
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-white/60 hover:text-white transition-opacity translate-y-0.5"
                  title="Modify name"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs md:text-sm text-blue-100/80 max-w-xl font-medium pt-1">
            Build consistent academic habits. Integrate Pomodoro, manage checklists, and unlock statistics.
          </p>
        </div>

        {/* Dynamic Study Habit Badge */}
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner z-10 shrink-0 md:max-w-xs self-start md:self-auto" id="streak_badge">
          <div className="bg-amber-400 text-slate-900 p-2.5 rounded-full mr-3">
            <Award size={20} className="animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">Current Status</span>
            <span className="text-sm font-bold block mt-0.5">Focus Achiever</span>
            <span className="text-xs text-white/70 block mt-0.5">Logs validated: {studyLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics cards (DASHBOARD counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="dashboard_metrics_row">
        {/* Total Hours */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">Total Study Hours</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5 leading-none font-mono">
              {totalStudyHoursFormatted} <span className="text-xs font-sans font-normal text-slate-500">hours</span>
            </span>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">Tracked Courses</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5 leading-none">
              {subjects.length} <span className="text-xs font-sans font-normal text-slate-500">subjects</span>
            </span>
          </div>
        </div>

        {/* Task Progress Tracker Card */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Task Progress Percentage</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              {completedTasks}/{totalTasks} ({taskProgressPercentage}%)
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${taskProgressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>{pendingTasks} Pending Goals</span>
            <span>{completedTasks} Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Statistics SVG Chart (9 columns) */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-xl border border-blue-500/10 dark:border-purple-500/10 transition-colors duration-300 flex flex-col lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                Weekly Study Statistics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of studied hours tracked across the past 7 days
              </p>
            </div>
            
            {/* Visual KPI badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15 rounded-full text-xs font-semibold">
              <TrendingUp size={13} />
              <span>Studying Habit: Consistent</span>
            </div>
          </div>

          {/* Graphical SVG Bar-Chart representing historical logs */}
          <div className="relative w-full h-48 md:h-56 mt-2 flex items-end justify-between px-2 text-center select-none" id="weekly_stats_barchart_container">
            {/* Grid backgrounds */}
            <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-slate-100 dark:border-slate-800/60 w-full h-px" />
              <div className="border-b border-slate-100 dark:border-slate-800/60 w-full h-px" />
              <div className="border-b border-slate-100 dark:border-slate-800/60 w-full h-px" />
              <div className="border-b border-slate-100 dark:border-slate-800/60 w-full h-px" />
            </div>

            {/* Bars mapping */}
            {weeklyChartData.map((data, index) => {
              const barHeightPct = Math.min((data.hours / maxWeeklyHours) * 100, 100);
              const isToday = index === 6; // last item is today
              
              return (
                <div key={data.dateStr} className="flex-1 flex flex-col items-center h-full group z-10">
                  <div className="w-full flex-1 flex items-end justify-center px-1.5 md:px-3">
                    {/* Interactive Popover label hover */}
                    <div className="relative w-full flex justify-center">
                      <div className="absolute bottom-full mb-1.5 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {data.hours} hrs
                      </div>

                      {/* Bar body */}
                      <div
                        className={`w-5 sm:w-8 md:w-11 rounded-t-lg transition-all duration-500 hover:opacity-90 ${
                          isToday
                            ? 'bg-gradient-to-t from-blue-500 to-purple-600 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-indigo-400 dark:bg-indigo-500/50 hover:bg-gradient-to-t hover:from-blue-400 hover:to-indigo-500'
                        }`}
                        style={{ height: `${Math.max(barHeightPct, 6)}%` }} // minimum height so people notice days active but low
                      />
                    </div>
                  </div>
                  
                  {/* Calendar day names */}
                  <div className="pt-2 h-6">
                    <span className={`text-[10px] md:text-xs font-semibold ${isToday ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {data.dayName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Daily Motivation Prompt Tip (4 columns) */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-xl border border-blue-500/10 dark:border-purple-500/10 transition-colors duration-300 flex flex-col justify-between lg:col-span-4 relative overflow-hidden" id="dashboard_tips_card">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
          
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <Lightbulb size={18} />
              </div>
              <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Daily Study Tip
              </h3>
            </div>
            
            <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed font-normal italic">
              "{MOTIVATIONAL_TIPS[tipIndex]}"
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 mt-6 flex justify-between items-center z-10 text-[10px] text-slate-405">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-purple-500" />
              <span>Optimized Learning Tips</span>
            </span>
            <button
              onClick={() => setTipIndex((prev) => (prev + 1) % MOTIVATIONAL_TIPS.length)}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              Next Tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
