/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle, Check, X } from 'lucide-react';
import { Subject, StudyLog } from '../types';
import { SUBJECT_COLORS, getSubjectColorClasses, getSubjectStudyHours } from '../utils';

interface SubjectManagerProps {
  subjects: Subject[];
  studyLogs: StudyLog[];
  onAddSubject: (name: string, color: string) => void;
  onEditSubject: (id: string, name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;
}

export default function SubjectManager({
  subjects,
  studyLogs,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: SubjectManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('indigo');
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('indigo');
  
  // Confirmation state before deletion
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim(), newSubjectColor);
    setNewSubjectName('');
    setShowAddForm(false);
  };

  const handleStartEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditColor(subject.color);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onEditSubject(id, editName.trim(), editColor);
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-xl border border-blue-500/10 dark:border-purple-500/10 transition-colors duration-300" id="subject_manager_card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            Academic Subjects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your courses and view tracked study duration
          </p>
        </div>
        
        {!showAddForm && (
          <button
            id="toggle_add_subject_btn"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-xs font-semibold hover:opacity-95 shadow-sm transition-all duration-300 active:scale-95"
          >
            <Plus size={14} />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Add Subject Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800" id="add_subject_form">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Subject Entry</h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="new_subject_name" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Subject Name</label>
              <input
                id="new_subject_name"
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g. Organic Chemistry, Computer Networks"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>

            <div>
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-2">Subject Color Accent</span>
              <div className="flex flex-wrap gap-2.5">
                {SUBJECT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewSubjectColor(color.value)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color.fill} border-2 ${
                      newSubjectColor === color.value 
                        ? 'border-slate-800 dark:border-white scale-110 shadow' 
                        : 'border-transparent opacity-85 hover:opacity-100'
                    }`}
                    title={color.label}
                  >
                    {newSubjectColor === color.value && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-slate-250 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95"
              >
                Create Subject
              </button>
            </div>
          </div>
        </form>
      )}

      {/* No Subjects Display */}
      {subjects.length === 0 && (
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/10">
          <BookOpen className="text-slate-300 dark:text-slate-600 mb-2.5" size={32} />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No courses listed</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
            Add subjects above to allocate study records and organize your agenda.
          </p>
        </div>
      )}

      {/* Subject list */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="subjects_gird_container">
          {subjects.map((subject) => {
            const colorClasses = getSubjectColorClasses(subject.color);
            const totalHours = getSubjectStudyHours(subject.id, studyLogs);
            const isEditing = editingId === subject.id;
            const isConfirmingDelete = confirmDeleteId === subject.id;

            return (
              <div
                key={subject.id}
                className="group relative flex flex-col p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden"
              >
                {/* Visual accent color strip */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${colorClasses.fill}`} />

                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3 pl-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1.5">
                        {SUBJECT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setEditColor(color.value)}
                            className={`w-5 h-5 rounded-full ${color.fill} ${
                              editColor === color.value ? 'ring-2 ring-slate-800 dark:ring-white scale-105' : 'opacity-80'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:text-slate-600"
                        >
                          <X size={13} />
                        </button>
                        <button
                          onClick={() => handleSaveEdit(subject.id)}
                          className="p-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          <Check size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isConfirmingDelete ? (
                  // Safety Delete confirmation
                  <div className="flex flex-col h-full justify-between pl-2">
                    <div className="flex items-start gap-1.5 text-xs text-rose-500 font-medium">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>Are you sure? Removing this course is irreversible! It deletes subject-linked tasks.</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteSubject(subject.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 rounded-md text-xs bg-rose-500 text-white hover:bg-rose-600 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  // Standard Mode
                  <div className="flex flex-col h-full justify-between pl-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-medium text-sm text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                        {subject.name}
                      </h4>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(subject)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                          title="Edit course"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(subject.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                          title="Delete course"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}`}>
                        {subject.color.toUpperCase()}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Studied</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold">{totalHours} hrs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
