/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Task, Project, TaskStatus, TaskPriority, User } from '../types';
import { useApp } from '../context/AppContext';
import { AlertCircle, Calendar, Plus, X, Loader2 } from 'lucide-react';

interface CreateEditTaskModalProps {
  task?: Task | null; // If passed, we are editing
  onClose: () => void;
  defaultStatus?: TaskStatus; // If creating from a specific Kanban column
  defaultProjectId?: string; // If creating inside a specific project already
}

export const CreateEditTaskModal: React.FC<CreateEditTaskModalProps> = ({
  task,
  onClose,
  defaultStatus = 'todo',
  defaultProjectId
}) => {
  const { projects, users, createTask, updateTask, addToast } = useApp();

  const isEditing = !!task;

  // Form Fields
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [projectId, setProjectId] = useState(task ? task.projectId : (defaultProjectId || (projects[0]?.id || '')));
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId || 'unassigned');
  const [status, setStatus] = useState<TaskStatus>(task ? task.status : defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task ? task.priority : 'medium');
  const [dueDate, setDueDate] = useState(task ? task.dueDate : '2026-06-15');
  const [labelsInput, setLabelsInput] = useState(task ? task.labels?.join(', ') || '' : '');

  // Validation States
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string; projectId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus Management
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const projectSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    // Focus title field on load
    titleInputRef.current?.focus();
    // Scroll lock background
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Listener to close on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation checks
    const newErrors: typeof errors = {};
    const todayStr = '2026-06-02'; // Local date anchor

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 120) {
      newErrors.title = 'Title must be 120 characters or less';
    }

    if (!projectId) {
      newErrors.projectId = 'Project selection is required';
    }

    if (dueDate && dueDate < todayStr) {
      newErrors.dueDate = 'Due date cannot be in the past (June 2, 2026)';
    }

    setErrors(newErrors);

    // Focus first error field
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title) {
        titleInputRef.current?.focus();
      } else if (newErrors.projectId) {
        projectSelectRef.current?.focus();
      } else if (newErrors.dueDate) {
        dateInputRef.current?.focus();
      }
      addToast('Please correct form validation errors before saving', 'error');
      return;
    }

    // Process Labels
    const labels = labelsInput
      .split(',')
      .map(part => part.trim().toLowerCase())
      .filter(part => part.length > 0);

    setIsSubmitting(true);

    // Simulate saving spinner (PRD Section 5.1 & 5.6)
    setTimeout(() => {
      const taskPayload = {
        title: title.trim(),
        description: description.trim(),
        projectId,
        assigneeId: assigneeId === 'unassigned' ? null : assigneeId,
        status,
        priority,
        dueDate,
        labels
      };

      if (isEditing && task) {
        updateTask(task.id, taskPayload);
        addToast(`Task "${title.slice(0, 20)}..." updated successfully!`, 'success');
      } else {
        createTask(taskPayload);
      }

      setIsSubmitting(false);
      onClose();
    }, 700); // 700ms simulation
  };

  return (
    <div
      id="modal-task-form-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-all animate-fade-in"
      onClick={onClose}
    >
      <div
        id="modal-task-form-panel"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <h3 id="form-modal-title" className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            {isEditing ? 'Modify Task Details' : 'Launch New Task'}
          </h3>
          <button
            id="task-form-close-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form body */}
        <form id="task-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Title row */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <label htmlFor="task-title-input">TITLE (REQUIRED)</label>
              <span className={`text-[10px] ${title.length > 120 ? 'text-red-500 font-bold' : ''}`}>
                {title.length}/120
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="task-title-input"
              type="text"
              placeholder="e.g., Design landing page layout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-full font-sans ${
                errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
              }`}
            />
            {errors.title && (
              <span id="title-error" className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </span>
            )}
          </div>

          {/* Project Choice Row */}
          <div className="space-y-1.5">
            <label htmlFor="task-project-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              ASSIGN TO BOARD PROJECT
            </label>
            <select
              ref={projectSelectRef}
              id="task-project-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={`block w-full p-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                errors.projectId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <option value="" disabled>-- Select board project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <span className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.projectId}
              </span>
            )}
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="task-description-textarea" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              DESCRIPTION & SCOPE
            </label>
            <textarea
              id="task-description-textarea"
              rows={3}
              placeholder="Provide a description of context, goals, links, and dependencies..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-3xs font-sans"
            />
          </div>

          {/* Grid fields for status, priority, due date and member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Status Option */}
            <div className="space-y-1.5">
              <label htmlFor="task-status-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                BOARD COLUMN status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="block w-full p-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Option */}
            <div className="space-y-1.5">
              <label htmlFor="task-priority-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                PRIORITY INTENSITY
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="block w-full p-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee Option */}
            <div className="space-y-1.5">
              <label htmlFor="task-assignee-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                CHOOSE ASSIGNEE
              </label>
              <select
                id="task-assignee-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="block w-full p-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="unassigned">-- Unassigned --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due date picker */}
            <div className="space-y-1.5">
              <label htmlFor="task-duedate-input" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> DUE DEADLINE
              </label>
              <input
                ref={dateInputRef}
                id="task-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`block w-full p-2 border text-sm rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.dueDate && (
                <span id="date-error" className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.dueDate}
                </span>
              )}
            </div>

          </div>

          {/* Labels Row */}
          <div className="space-y-1.5">
            <label htmlFor="task-labels-input" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              LABELS / TAGS (COMMA SEPARATED)
            </label>
            <input
              id="task-labels-input"
              type="text"
              placeholder="e.g., frontend, mobile, bug, hotfix"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
            <button
              id="task-form-cancel"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-350 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="task-form-submit"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/15 flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-blue-500/20 disabled:bg-blue-600/60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{isEditing ? 'Save edits' : 'Launch task'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
