/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, User, Comment, TaskStatus, TaskPriority } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  AlertTriangle,
  User as UserIcon,
  MessageSquare,
  Trash2,
  Edit3,
  Bookmark,
  Send,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEditClick: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onEditClick }) => {
  const {
    users,
    projects,
    comments,
    currentUser,
    updateTask,
    deleteTask,
    addComment
  } = useApp();

  const [newCommentText, setNewCommentText] = useState('');

  // Lock body scroll when open
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [task]);

  // Listener to close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!task) return null;

  const project = projects.find(p => p.id === task.projectId);
  const assignee = users.find(u => u.id === task.assigneeId);
  const taskComments = comments.filter(c => c.taskId === task.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTask(task.id, { status: e.target.value as TaskStatus });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTask(task.id, { priority: e.target.value as TaskPriority });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    updateTask(task.id, { assigneeId: selectedId === 'unassigned' ? null : selectedId });
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleDelete = () => {
    if (window.confirm('Are you absolute sure you want to delete this task? This action is irreversible.')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const formatDateString = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      id="task-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 transition-all pointer-events-auto backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="task-detail-modal"
        className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Details Panel (Left Column) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-slate-100 dark:border-slate-800 space-y-6">
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Bookmark className="w-4 h-4 text-blue-500" />
              {project?.name || 'BOARD TASK'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="detail-edit-task"
                onClick={() => {
                  onEditClick(task);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Edit Task Details"
              >
                <Edit3 className="w-4.5 h-4.5" />
              </button>
              <button
                id="detail-delete-task"
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
              <button
                id="detail-close-modal"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <h2 id="detail-task-title" className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {task.title}
            </h2>
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">DESCRIPTION</h5>
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
              <p id="detail-task-desc" className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description || <span className="italic text-slate-400">No description provided.</span>}
              </p>
            </div>
          </div>

          {/* Labels List */}
          {task.labels && task.labels.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> LABELS
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map(l => (
                  <span key={l} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200/50">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Field Configurations */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            
            {/* Status Field Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="detail-status-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                STATUS
              </label>
              <select
                id="detail-status-select"
                value={task.status}
                onChange={handleStatusChange}
                className="block w-full p-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Field Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="detail-priority-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                PRIORITY
              </label>
              <select
                id="detail-priority-select"
                value={task.priority}
                onChange={handlePriorityChange}
                className="block w-full p-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee Selection Field */}
            <div className="space-y-1.5">
              <label htmlFor="detail-assignee-select" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" /> ASSIGNEE
              </label>
              <select
                id="detail-assignee-select"
                value={task.assigneeId || 'unassigned'}
                onChange={handleAssigneeChange}
                className="block w-full p-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="unassigned">-- Unassigned --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due date indicator */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> DUE DATE
              </span>
              <div id="detail-task-datetime" className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-755 rounded-lg bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-sm font-medium">
                {task.dueDate}
              </div>
            </div>

          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-[11px] text-slate-450 dark:text-slate-500 flex flex-col gap-1">
            <span id="detail-date-created">Created: {formatDateString(task.createdAt)}</span>
            <span id="detail-date-updated">Last modifications: {formatDateString(task.updatedAt)}</span>
          </div>

        </div>

        {/* Comments Feed Panel (Right Column) */}
        <div className="w-full md:w-[360px] bg-slate-50 dark:bg-slate-950 p-6 flex flex-col h-full overflow-hidden max-h-[400px] md:max-h-full">
          
          {/* Comments Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Comments
              <span className="font-mono text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {taskComments.length}
              </span>
            </h3>
            <button
              id="detail-close-btn-desktop"
              onClick={onClose}
              className="hidden lg:block p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comments Lists */}
          <div
            id="comments-scroller"
            className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
          >
            {taskComments.length > 0 ? (
              taskComments.map(c => {
                const commentor = users.find(u => u.id === c.authorId);
                return (
                  <div key={c.id} className="space-y-1 p-2.5 rounded-xl border border-slate-150/60 dark:border-slate-850/60 bg-white dark:bg-slate-900 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 text-[9px] font-bold font-mono text-slate-600 dark:text-slate-350 flex items-center justify-center">
                          {commentor?.initials || 'TF'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {commentor?.name || 'Unknown User'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 italic">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans whitespace-pre-wrap pl-1">
                      {c.body}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 stroke-1" />
                <p className="text-xs text-slate-400 dark:text-slate-600 font-semibold mt-2">No discussion yet</p>
                <p className="text-[11px] text-slate-450 dark:text-slate-605 mt-0.5 max-w-44">Start the conversation below.</p>
              </div>
            )}
          </div>

          {/* Comment composer box */}
          <form id="comment-composer-form" onSubmit={submitComment} className="mt-auto">
            <div className="relative">
              <textarea
                id="comment-textarea"
                rows={2}
                placeholder="Ask a question or post progress..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="block w-full px-3 py-2 pr-12 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-inner resize-none font-sans"
              />
              <button
                id="send-comment-btn"
                type="submit"
                disabled={!newCommentText.trim()}
                className={`absolute bottom-2.5 right-2 text-white p-1.5 rounded-lg transition-colors cursor-pointer ${
                  newCommentText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                title="Send Comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
