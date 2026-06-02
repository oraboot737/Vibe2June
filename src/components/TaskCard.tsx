/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, User, Project } from '../types';
import { useApp } from '../context/AppContext';
import { MessageSquare, Calendar, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { users, projects } = useApp();

  const assignee = users.find(u => u.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  // Drag-and-drop triggers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    const element = document.getElementById(`task-card-${task.id}`);
    if (element) {
      element.classList.add('opacity-40');
    }
  };

  const handleDragEnd = () => {
    const element = document.getElementById(`task-card-${task.id}`);
    if (element) {
      element.classList.remove('opacity-40');
    }
  };

  // Overdue check based on anchor local date: 2026-06-02
  const checkOverdue = () => {
    if (task.status === 'done') return false;
    const deadline = new Date(task.dueDate);
    const today = new Date('2026-06-02'); // Fixed anchor parameter
    return deadline < today;
  };

  const isOverdue = checkOverdue();

  // Highlight date formatter
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Priority color tags
  const getPriorityClasses = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      case 'medium':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
      case 'high':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-900/30';
      case 'urgent':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-pulse';
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-750 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-grab active:cursor-grabbing space-y-3 relative group"
    >
      {/* Project name and priority row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {project && (
          <span
            id={`task-project-tag-${task.id}`}
            className="font-medium text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-32"
          >
            {project.name}
          </span>
        )}
        <span
          id={`task-priority-${task.id}`}
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityClasses(task.priority)}`}
        >
          {task.priority}
        </span>
      </div>

      {/* Task Title */}
      <h4
        id={`task-title-${task.id}`}
        className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
      >
        {task.title}
      </h4>

      {/* Tags row */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map(label => (
            <span
              key={label}
              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-50 dark:bg-slate-850 text-slate-550 dark:text-slate-400 border border-slate-100 dark:border-slate-750"
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Divider line style */}
      <div className="w-full h-px bg-slate-50 dark:bg-slate-750" />

      {/* Metadata and avatar row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5 text-slate-400 dark:text-slate-500 text-xs">
          
          {/* Due date tag */}
          <div
            id={`task-date-${task.id}`}
            className={`flex items-center gap-1 py-0.5 px-1.5 rounded text-[11px] font-medium ${
              isOverdue
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                : 'text-slate-550 dark:text-slate-450'
            }`}
            title={isOverdue ? 'Overdue task!' : 'Due date'}
          >
            {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            <span>{formatDate(task.dueDate)}</span>
          </div>

          {/* Comment Counter */}
          {task.commentCount > 0 && (
            <div id={`task-comment-count-${task.id}`} className="flex items-center gap-1.5 text-slate-450 text-[11px]" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.commentCount}</span>
            </div>
          )}
        </div>

        {/* Assignee initials circles grouped */}
        <div className="flex items-center">
          {assignee ? (
            <div
              id={`task-assignee-${task.id}`}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 text-[10px] font-bold font-mono border border-white dark:border-slate-805"
              title={`Assigned to ${assignee.name}`}
            >
              {assignee.initials}
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-750 text-slate-400 text-[10px] border border-dashed border-slate-300 dark:border-slate-700"
              title="Unassigned"
            >
              --
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
