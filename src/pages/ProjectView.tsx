/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Task, Project, TaskStatus, TaskPriority, User } from '../types';
import { KanbanColumn } from '../components/KanbanColumn';
import { TaskCard } from '../components/TaskCard';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { CreateEditTaskModal } from '../components/CreateEditTaskModal';
import {
  Trello,
  List,
  Search,
  Plus,
  Star,
  Users,
  Filter,
  ArrowUpDown,
  CornerDownRight,
  Sparkles,
  Inbox
} from 'lucide-react';

type ProjectViewTab = 'board' | 'list';
type SortColumn = 'title' | 'assignee' | 'priority' | 'status' | 'dueDate' | 'commentCount';
type SortDirection = 'asc' | 'desc';

export const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    projects,
    tasks,
    users,
    currentUser,
    toggleStarProject,
    moveTaskStatus,
    updateTask,
    addToast
  } = useApp();
  const navigate = useNavigate();

  // Active View Tab State
  const [activeTab, setActiveTab] = useState<ProjectViewTab>('board');

  // Interactive filters
  const [searchFilter, setSearchFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Listing Sorters (applicable only to List view)
  const [sortColumn, setSortColumn] = useState<SortColumn>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Selected State for overlays
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [addTaskDefaultStatus, setAddTaskDefaultStatus] = useState<TaskStatus>('todo');

  // Find exact project matching route parameter
  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  if (!project) {
    return (
      <div id="project-not-found" className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center p-6">
        <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700 stroke-1" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider mt-4">Project Workspace Absent</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1.5">
          This project could not be loaded or has been deleted.
        </p>
        <button
          id="project-nf-btn"
          onClick={() => navigate('/')}
          className="mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 cursor-pointer"
        >
          Return to home panel
        </button>
      </div>
    );
  }

  // Find members avatars
  const projectMembers = useMemo(() => {
    return users.filter(u => project.memberIds.includes(u.id));
  }, [users, project]);

  // Is checked starred project
  const isStarred = currentUser?.starredProjects?.includes(project.id) || false;

  // Filter project-specific tasks matching search filter and tags
  const filteredTasks = useMemo(() => {
    let listParts = tasks.filter(t => t.projectId === project.id);

    // Filter by text search
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase().trim();
      listParts = listParts.filter(
        t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Filter by Assignee
    if (assigneeFilter !== 'all') {
      listParts = listParts.filter(t => t.assigneeId === assigneeFilter);
    }

    // Filter by Priority
    if (priorityFilter !== 'all') {
      listParts = listParts.filter(t => t.priority === priorityFilter);
    }

    return listParts;
  }, [tasks, project.id, searchFilter, assigneeFilter, priorityFilter]);

  // Sort matched list for grid views (Table)
  const sortedTasks = useMemo(() => {
    if (activeTab !== 'list') return filteredTasks;

    const returnSorted = [...filteredTasks];

    returnSorted.sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (sortColumn === 'assignee') {
        const userA = users.find(u => u.id === a.assigneeId);
        const userB = users.find(u => u.id === b.assigneeId);
        valA = userA ? userA.name : 'zzzz';
        valB = userB ? userB.name : 'zzzz';
      }

      // Priority relative scale
      const priorityWeights: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3, urgent: 4 };
      if (sortColumn === 'priority') {
        valA = priorityWeights[a.priority];
        valB = priorityWeights[b.priority];
      }

      // Status weights
      const statusWeights: Record<TaskStatus, number> = { todo: 1, in_progress: 2, in_review: 3, done: 4 };
      if (sortColumn === 'status') {
        valA = statusWeights[a.status];
        valB = statusWeights[b.status];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return returnSorted;
  }, [filteredTasks, activeTab, sortColumn, sortDirection, users]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchFilter('');
    setAssigneeFilter('all');
    setPriorityFilter('all');
    addToast('Cleared all dashboard filters', 'info');
  };

  // Status-specific lists for board categories
  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === 'todo'), [filteredTasks]);
  const progressTasks = useMemo(() => filteredTasks.filter(t => t.status === 'in_progress'), [filteredTasks]);
  const reviewTasks = useMemo(() => filteredTasks.filter(t => t.status === 'in_review'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter(t => t.status === 'done'), [filteredTasks]);

  const openAddTaskInColumn = (status: TaskStatus) => {
    setAddTaskDefaultStatus(status);
    setShowAddTask(true);
  };

  return (
    <div id={`project-view-${project.id}`} className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Project Workspace Header row */}
      <section id="project-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs transition-colors">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: project.color }} />
            <h1 id="project-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-845 dark:text-white">
              {project.name}
            </h1>
            <button
              id={`star-project-${project.id}`}
              onClick={() => toggleStarProject(project.id)}
              className="p-1 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-505 cursor-pointer"
              title={isStarred ? 'Remove favorites board' : 'Add favorites board'}
            >
              <Star className={`w-5 h-5 ${isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>
          </div>
          <p id="project-desc" className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {project.description || 'No description established for this workspace.'}
          </p>
        </div>

        {/* View mode toggle navigation */}
        <div className="flex items-center gap-3">
          <div id="view-type-toggles" className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              id="toggle-board-view"
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'board'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <Trello className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              id="toggle-list-view"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List Grid</span>
            </button>
          </div>

          <button
            id="proj-add-task-btn"
            onClick={() => openAddTaskInColumn('todo')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Task</span>
          </button>
        </div>
      </section>

      {/* Filter and Search controls Row */}
      <section id="filters-container" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 gap-4 flex flex-col md:flex-row md:items-center justify-between transition-colors shadow-3xs">
        
        {/* Local Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="local-search-input"
            type="text"
            placeholder="Search within project..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Dynamic Select Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
          
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-assignee-select"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">Every Assignee</option>
              {projectMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-priority-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>

          {/* Clean up filter trigger */}
          {(searchFilter || assigneeFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              id="clear-filters-lnk"
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 tracking-wide uppercase transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}

        </div>

        <div className="text-right text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          Matches: {filteredTasks.length} tasks
        </div>

      </section>

      {/* Main View Display Context boards */}
      <section id="project-tabs-container" className="overflow-hidden">
        
        {/* Kanban Board View Render */}
        {activeTab === 'board' && (
          <div
            id="kanban-drag-stage"
            className="flex items-start gap-5 overflow-x-auto pb-4 select-none pr-2 scrollbar-thin scrollbar-thumb-slate-200"
          >
            <KanbanColumn
              id="todo"
              title="To Do"
              tasks={todoTasks}
              onTaskClick={setSelectedTask}
              onAddTaskClick={openAddTaskInColumn}
              moveTaskStatus={moveTaskStatus}
            />
            <KanbanColumn
              id="in_progress"
              title="In Progress"
              tasks={progressTasks}
              onTaskClick={setSelectedTask}
              onAddTaskClick={openAddTaskInColumn}
              moveTaskStatus={moveTaskStatus}
            />
            <KanbanColumn
              id="in_review"
              title="In Review"
              tasks={reviewTasks}
              onTaskClick={setSelectedTask}
              onAddTaskClick={openAddTaskInColumn}
              moveTaskStatus={moveTaskStatus}
            />
            <KanbanColumn
              id="done"
              title="Done"
              tasks={doneTasks}
              onTaskClick={setSelectedTask}
              onAddTaskClick={openAddTaskInColumn}
              moveTaskStatus={moveTaskStatus}
            />
          </div>
        )}

        {/* Dense Table Grid View Render */}
        {activeTab === 'list' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs overflow-hidden select-text transition-colors">
            {sortedTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/35 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-450 uppercase select-none">
                      <th className="px-6 py-3.5 font-medium">
                        <button
                          id="sort-col-title"
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>Task Title</span> <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </th>
                      <th className="px-4 py-3.5 font-medium">
                        <button
                          id="sort-col-assignee"
                          onClick={() => handleSort('assignee')}
                          className="flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>Assignee</span> <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </th>
                      <th className="px-4 py-3.5 font-medium">
                        <button
                          id="sort-col-priority"
                          onClick={() => handleSort('priority')}
                          className="flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>Priority</span> <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </th>
                      <th className="px-4 py-3.5 font-medium">
                        <button
                          id="sort-col-status"
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>Column Status</span> <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </th>
                      <th className="px-4 py-3.5 font-medium animate-in">
                        <button
                          id="sort-col-due"
                          onClick={() => handleSort('dueDate')}
                          className="flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>Due deadline</span> <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3.5 font-medium text-right">Discuss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {sortedTasks.map(task => {
                      const assignee = users.find(u => u.id === task.assigneeId);

                      const getPillColor = (priority: TaskPriority) => {
                        switch (priority) {
                          case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-805 dark:text-slate-350';
                          case 'medium': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400';
                          case 'high': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400';
                          case 'urgent': return 'bg-red-50 text-red-700 dark:bg-red-900/15 dark:text-red-400 font-bold';
                        }
                      };

                      return (
                        <tr
                          key={task.id}
                          id={`list-row-${task.id}`}
                          onClick={() => setSelectedTask(task)}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer transition-colors group"
                        >
                          {/* Title column */}
                          <td className="px-6 py-4.5 font-semibold text-slate-840 dark:text-slate-100 min-w-[200px]">
                            <div className="flex flex-col gap-1 pr-4">
                              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {task.title}
                              </span>
                              {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.labels.map(lbl => (
                                    <span key={lbl} className="text-[9px] px-1 py-0.2 bg-slate-100 dark:bg-slate-805 text-slate-500 rounded">
                                      #{lbl}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Member column */}
                          <td className="px-4 py-4.5">
                            {assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5.5 h-5.5 rounded-full bg-blue-105 dark:bg-blue-900 text-[10px] font-bold font-mono text-blue-755 dark:text-blue-100 flex items-center justify-center">
                                  {assignee.initials}
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                  {assignee.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-550 italic font-medium">Unassigned</span>
                            )}
                          </td>

                          {/* Priority badge */}
                          <td className="px-4 py-4.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPillColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>

                          {/* Column Status in-line selector changes */}
                          <td className="px-4 py-4.5" onClick={(e) => e.stopPropagation()}>
                            <select
                              id={`list-row-status-select-${task.id}`}
                              value={task.status}
                              onChange={(e) => {
                                updateTask(task.id, { status: e.target.value as TaskStatus });
                              }}
                              className="p-1 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md text-xs font-medium cursor-pointer focus:outline-none"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </td>

                          {/* Calendar due date */}
                          <td className="px-4 py-4.5">
                            <span className="text-xs font-mono font-medium text-slate-550 dark:text-slate-400">
                              {task.dueDate}
                            </span>
                          </td>

                          {/* Comment count */}
                          <td className="px-6 py-4.5 text-right font-mono text-xs text-slate-450 dark:text-slate-500 font-bold">
                            {task.commentCount > 0 ? (
                              <span className="bg-slate-100 dark:bg-slate-805 px-2 py-0.5 rounded-md">
                                {task.commentCount} comments
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">-</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Inbox className="w-12 h-12 text-slate-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-400 mt-3">No matching tasks</p>
                <p className="text-xs text-slate-500 mt-1">Please try modifying your text keywords or category dropdown selections.</p>
              </div>
            )}
          </div>
        )}

      </section>

      {/* Task Details Popup Overlay */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEditClick={(task) => {
            setSelectedTask(null);
            // Wait brief state change before loading form edit modal
            setTimeout(() => {
              setTaskToEdit(task);
              setShowEditTask(true);
            }, 50);
          }}
        />
      )}

      {/* Add Task Modal overlay */}
      {showAddTask && (
        <CreateEditTaskModal
          defaultStatus={addTaskDefaultStatus}
          defaultProjectId={project.id}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {/* Edit Task Modal overlay */}
      {showEditTask && taskToEdit && (
        <CreateEditTaskModal
          task={taskToEdit}
          onClose={() => {
            setShowEditTask(false);
            setTaskToEdit(null);
          }}
        />
      )}

    </div>
  );
};
