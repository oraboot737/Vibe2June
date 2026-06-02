/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { CreateEditTaskModal } from '../components/CreateEditTaskModal';
import { Library, AlertCircle, Sparkles, HelpCircle, Delete, ArrowRight } from 'lucide-react';

export const SearchResults: React.FC = () => {
  const { tasks, projects, globalSearchQuery, setGlobalSearchQuery } = useApp();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);

  // Active criteria filters
  const [projectIdFilter, setProjectIdFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Compute matched items
  const matches = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];

    const query = globalSearchQuery.toLowerCase().trim();
    let pool = tasks.filter(
      t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
    );

    // Apply secondary filters
    if (projectIdFilter !== 'all') {
      pool = pool.filter(t => t.projectId === projectIdFilter);
    }
    if (statusFilter !== 'all') {
      pool = pool.filter(t => t.status === statusFilter);
    }

    return pool;
  }, [tasks, globalSearchQuery, projectIdFilter, statusFilter]);

  const handleClear = () => {
    setGlobalSearchQuery('');
    setProjectIdFilter('all');
    setStatusFilter('all');
  };

  return (
    <div id="search-results-viewport" className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Search Header Banner */}
      <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs transition-colors space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-845 dark:text-white flex items-center gap-2">
              <Library className="w-5.5 h-5.5 text-blue-500" /> Dynamic Search queries
            </h1>
            <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
              Scanning indices across all boards for matching terms.
            </p>
          </div>
          
          {/* Quick Clear controls */}
          {globalSearchQuery && (
            <button
              id="clear-search-btn"
              onClick={handleClear}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase cursor-pointer"
            >
              Clear keywords
            </button>
          )}
        </div>

        {/* Display info */}
        {globalSearchQuery && (
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 font-sans pt-1">
            Showing results for <span className="text-blue-600 font-bold">"{globalSearchQuery}"</span>
          </div>
        )}
      </section>

      {/* Query Filter panel Row */}
      {globalSearchQuery && (
        <section id="search-filters-bar" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <span>Filter project:</span>
            <select
              id="search-proj-filter-select"
              value={projectIdFilter}
              onChange={(e) => setProjectIdFilter(e.target.value)}
              className="p-1 px-1.5 border border-slate-205 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-710 rounded-md cursor-pointer"
            >
              <option value="all">Every Board</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <span>Filter status:</span>
            <select
              id="search-status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1 px-1.5 border border-slate-205 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-710 rounded-md cursor-pointer"
            >
              <option value="all">Every status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="ml-auto text-[11px] font-mono font-bold text-slate-400 uppercase">
            matches: {matches.length} articles
          </div>

        </section>
      )}

      {/* Results grid rendering */}
      <div id="search-results-board">
        {!globalSearchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-center p-6 transition-colors shadow-3xs">
            <Library className="w-12 h-12 text-slate-200 dark:text-slate-750 stroke-1" />
            <h3 className="text-base font-bold text-slate-405 mt-4 uppercase">Awaiting query</h3>
            <p className="text-xs text-slate-450 max-w-sm mt-1.5">
              Type keywords in the top navigation bar search input to locate cards across all visual projects.
            </p>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(t => (
              <TaskCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-center p-6 transition-colors shadow-3xs">
            <AlertCircle className="w-12 h-12 text-rose-300 dark:text-rose-900/30 stroke-1" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white uppercase mt-4">No matching results</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5">
              We couldn't locate any tasks matching "{globalSearchQuery}". Double-check spelling or broaden your filters.
            </p>
            <button
              id="clear-all-search-cta"
              onClick={handleClear}
              className="mt-5 px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Search state
            </button>
          </div>
        )}
      </div>

      {/* Task detail Modal overlay */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEditClick={(task) => {
            setSelectedTask(null);
            setTimeout(() => {
              setSelectedTask(task);
              setIsEditingTask(true);
            }, 50);
          }}
        />
      )}

      {/* Task Editor modal wrapper overlay */}
      {selectedTask && isEditingTask && (
        <CreateEditTaskModal
          task={selectedTask}
          onClose={() => {
            setIsEditingTask(false);
            setSelectedTask(null);
          }}
        />
      )}

    </div>
  );
};
