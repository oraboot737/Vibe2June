/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, ArrowRight } from 'lucide-react';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTaskClick: (status: TaskStatus) => void;
  moveTaskStatus: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTaskClick,
  moveTaskStatus
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStatus(taskId, id);
    }
  };

  // Status color codes for headers
  const getHeaderStyle = (columnId: TaskStatus) => {
    switch (columnId) {
      case 'todo':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-350';
      case 'in_review':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-350';
      case 'done':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-350';
    }
  };

  return (
    <div
      id={`kanban-column-${id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-72 h-full max-h-[calc(105vh-12rem)] flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-3 border-2 transition-all ${
        isOver
          ? 'border-dashed border-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
          : 'border-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1.5 py-1">
        <div className="flex items-center gap-2">
          <span
            id={`column-badge-${id}`}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getHeaderStyle(id)}`}
          >
            {title}
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
            {tasks.length}
          </span>
        </div>
        <button
          id={`column-add-btn-${id}`}
          onClick={() => onAddTaskClick(id)}
          className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Add task to this column"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards list Container */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent select-none min-h-[150px]"
      >
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-center"
          >
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No tasks here</p>
            <button
              id={`empty-cta-${id}`}
              onClick={() => onAddTaskClick(id)}
              className="text-[10px] text-blue-500 hover:text-blue-600 font-bold mt-1 inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Add custom</span> <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
