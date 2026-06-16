/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Check, AlertCircle } from 'lucide-react';
import { Subject } from '../types';
import { getSubjectColorClasses } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface PomodoroTimerProps {
  subjects: Subject[];
  onLogStudySession: (subjectId: string, minutes: number) => void;
}

export default function PomodoroTimer({ subjects, onLogStudySession }: PomodoroTimerProps) {
  // Preset styles
  const PRESETS = [
    { label: 'Focus', minutes: 25, isBreak: false, icon: Flame, color: 'text-purple-500' },
    { label: 'Short Break', minutes: 5, isBreak: true, icon: Coffee, color: 'text-blue-500' },
    { label: 'Long Break', minutes: 15, isBreak: true, icon: Coffee, color: 'text-pink-500' },
  ];

  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showLogSuccess, setShowLogSuccess] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPreset = PRESETS[activePresetIndex];

  // Set default subject if subjects load
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Adjust time when active preset changes
  useEffect(() => {
    setTimeLeft(PRESETS[activePresetIndex].minutes * 60);
    setIsRunning(false);
  }, [activePresetIndex]);

  // Handle countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activePresetIndex, selectedSubjectId]);

  // Trigger gentle sound chime on completion using native Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Simple double note chime
      const playNote = (freq: number, delay: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      playNote(523.25, 0, 0.5); // C5
      playNote(659.25, 0.25, 0.5); // E5
    } catch (e) {
      console.warn('Audio synthesis support restricted or blocked by browser user gesture interaction.', e);
    }
  };

  const handleTimerExpiry = () => {
    setIsRunning(false);
    playChime();

    // Log focus session to the selected subject
    if (!currentPreset.isBreak) {
      const loggedSubjectId = selectedSubjectId || 'misc';
      onLogStudySession(loggedSubjectId, currentPreset.minutes);
      setSessionCount((prev) => prev + 1);
      setShowLogSuccess(true);
      setTimeout(() => setShowLogSuccess(false), 5000);
    }

    // Switch to helper next screen preset
    if (!currentPreset.isBreak) {
      // Toggle to short break after study
      setActivePresetIndex(1);
    } else {
      // Toggle back to focus
      setActivePresetIndex(0);
    }
  };

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentPreset.minutes * 60);
  };

  // Human readable time format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculates percentage for visualization
  const totalSeconds = currentPreset.minutes * 60;
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-xl border border-blue-500/10 dark:border-purple-500/10 transition-colors duration-300 flex flex-col relative overflow-hidden" id="pomodoro_timer_card">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-10">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            Focus Space
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pomodoro timer technique for maximum retention
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 font-mono text-xs">
          <Flame size={13} className="animate-pulse" />
          <span>Session #{sessionCount + 1}</span>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-6 z-10 justify-between items-center w-full">
        {PRESETS.map((preset, idx) => {
          const PresetIcon = preset.icon;
          const isActive = idx === activePresetIndex;
          return (
            <button
              key={preset.label}
              id={`preset_${preset.label.toLowerCase().replace(' ', '_')}`}
              onClick={() => {
                setActivePresetIndex(idx);
                setIsRunning(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <PresetIcon size={14} className={isActive ? 'text-white' : preset.color} />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 z-10 w-full my-auto flex-1">
        {/* Visual Ring and Timer Display */}
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Background Ring SVG */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="88"
              className="stroke-slate-100 dark:stroke-slate-700/60 transition-colors"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Active Progress Ring */}
            <circle
              cx="104"
              cy="104"
              r="88"
              className="stroke-purple-600 transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progressPercentage / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Core Time Display */}
          <div className="absolute text-center">
            <span className="text-4xl font-display font-bold text-slate-800 dark:text-white tracking-tight leading-none block">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1.5 block">
              {currentPreset.isBreak ? 'Relaxation' : 'Focus Time'}
            </span>
          </div>
        </div>

        {/* Configurations and Controls */}
        <div className="flex-1 flex flex-col justify-center w-full gap-4">
          {/* Active Subject Selector for Pomodoro */}
          {!currentPreset.isBreak && subjects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                Link Study Hour to Subject
              </label>
              <select
                id="pomodoro_subject_selector"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="misc">Miscellaneous Tasks</option>
              </select>
            </div>
          )}

          {!currentPreset.isBreak && subjects.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>Create subjects first in the Subject panel to bind your study progress hours explicitly!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-1.5">
            <button
              id="pomodoro_start_pause"
              onClick={handleToggleTimer}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm shadow-md transition-all duration-300 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-95 text-white active:scale-95'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
            </button>
            
            <button
              id="pomodoro_reset"
              onClick={handleResetTimer}
              className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {showLogSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-4 right-4 bg-emerald-500 text-white p-3 rounded-xl shadow-lg flex items-center gap-2.5 z-20 text-xs text-left"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <Check size={14} />
            </div>
            <div>
              <p className="font-semibold">Focused Completed!</p>
              <p className="text-white/80">Logged {currentPreset.minutes} study minutes successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
