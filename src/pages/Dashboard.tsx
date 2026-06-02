/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Task, Project } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { CreateEditTaskModal } from '../components/CreateEditTaskModal';
import {
  CalendarDays,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Users,
  Compass,
  ArrowUpRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks, projects, currentUser, users, moveTaskStatus } = useApp();
  const navigate = useNavigate();

  // Selected state for modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);

  // June 2, 2026 (Local time anchor)
  const TODAY_STR = '2026-06-02';

  // 1. My Tasks (assigned to current user)
  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);

  // Grouped myTasks
  const myCompletedTasks = myTasks.filter(t => t.status === 'done');
  const myPendingTasks = myTasks.filter(t => t.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Sort by deadline ascending

  // 2. Overdue Highlights (pendings & dueDate is in past)
  const myOverdueTasks = myPendingTasks.filter(t => t.dueDate < TODAY_STR);
  const myUpcomingTasks = myPendingTasks.filter(t => t.dueDate >= TODAY_STR);

  // 3. Count Summaries for tiles (based on ALL tasks in the workspace, or MY tasks)
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewCount = tasks.filter(t => t.status === 'in_review').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const totalTasksCount = tasks.length;
  const globalCompletionRate = totalTasksCount ? Math.round((doneCount / totalTasksCount) * 100) : 0;

  // 4. Calculate project cards info
  const projectCards = projects.map(proj => {
    const projTasks = tasks.filter(t => t.projectId === proj.id);
    const totalCount = projTasks.length;
    const completedCount = projTasks.filter(t => t.status === 'done').length;
    const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      id: proj.id,
      name: proj.name,
      description: proj.description,
      color: proj.color,
      totalCount,
      completedCount,
      percentage,
      members: users.filter(u => proj.memberIds.includes(u.id))
    };
  });

  return (
    <div id="dashboard-view" className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header Banner Welcome Row */}
      <div id="dashboard-hero" className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/10 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Greetings, {currentUser?.name || 'Workspace Member'}!
          </h1>
          <p className="text-xs text-blue-105 font-medium mt-1">
            TaskFlow compiled for your personal schedule. Daily review for June 2, 2026.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">My Completed Pace</span>
            <span className="text-lg font-bold font-mono">
              {myCompletedTasks.length} / {myTasks.length} Tasks
            </span>
          </div>
          <div className="h-10 w-px bg-blue-500" />
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 backdrop-blur-3xs px-4">
            <TrendingUp className="w-5 h-5 text-emerald-300" />
            <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest mt-0.5">PACE STABLE</span>
          </div>
        </div>
      </div>

      {/* Summary Grid strip of counts (To Do / In Progress / Done / In Review) */}
      <section id="metric-strip" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">To Do</span>
            <span className="text-xl font-bold dark:text-white font-mono">{todoCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-bold dark:text-white font-mono">{inProgressCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">In Review</span>
            <span className="text-xl font-bold dark:text-white font-mono">{inReviewCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Completed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold dark:text-white font-mono">{doneCount}</span>
              <span className="text-xs text-emerald-500 font-semibold">({globalCompletionRate}%)</span>
            </div>
          </div>
        </div>

      </section>

      {/* Main Two-Column Contents Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Columns: Overdue section and My Tasks list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overdue highlight card alerts */}
          {myOverdueTasks.length > 0 && (
            <section id="overdue-highlight-bar" className="bg-rose-50  dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-450">
                <AlertOctagon className="w-5.5 h-5.5" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Overdue Warnings ({myOverdueTasks.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {myOverdueTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 p-3.5 rounded-xl hover:shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest bg-rose-100 text-rose-750">
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-rose-500 font-bold">
                        Due {task.dueDate}
                      </span>
                    </div>
                    <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 truncate mt-1.5 hover:text-blue-500">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Core Panel: My Tasks (Sorted by Deadline) */}
          <section id="my-upcoming-tasks-panel" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-840 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" /> My Action Items ({myUpcomingTasks.length})
            </h2>
            {myUpcomingTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myUpcomingTasks.map(t => (
                  <TaskCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Compass className="w-10 h-10 text-slate-200 dark:text-slate-800 stroke-1" />
                <p className="text-xs font-bold text-slate-500 mt-2">Zero action items left</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">No tasks assigned to you. Choose a project board to claim backlog items or create a new objective!</p>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Board Project Cards lists */}
        <div className="space-y-6">
          <section id="projects-summary-shelf" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-840 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-500" /> Active Boards
              </h2>
              <button
                id="dash-projects-index-btn"
                onClick={() => navigate('/projects')}
                className="text-[11px] text-blue-500 hover:text-blue-600 font-bold uppercase tracking-wider inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Directories</span> <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {projectCards.map(p => (
                <div
                  key={p.id}
                  id={`dash-project-card-${p.id}`}
                  onClick={() => navigate(`/project/${p.id}`)}
                  className="group relative border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  {/* Decorative color border strip */}
                  <div className="absolute top-0 left-4 right-4 h-1 rounded-b-lg" style={{ backgroundColor: p.color }} />
                  
                  <div className="flex items-center justify-between gap-1 mt-1.5">
                    <span className="text-sm font-bold text-slate-805 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors">
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500">
                      {p.completedCount}/{p.totalCount} tasks
                    </span>
                  </div>

                  {/* Progress completion bar */}
                  <div className="w-full h-1.5 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden mt-3.5">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.percentage}%`, backgroundColor: p.color }} />
                  </div>

                  {/* Member avatars */}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">completion rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold font-mono" style={{ color: p.color }}>{p.percentage}%</span>
                      {p.members.length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {p.members.slice(0, 3).map(mem => (
                            <div
                              key={mem.id}
                              className="w-5 h-5 rounded-full bg-slate-205 dark:bg-slate-800 text-[8px] font-extrabold font-mono text-slate-650 flex items-center justify-center border border-white dark:border-slate-900"
                              title={mem.name}
                            >
                              {mem.initials}
                            </div>
                          ))}
                          {p.members.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-805 text-[8px] text-slate-500 flex items-center justify-center border border-white dark:border-slate-900 font-mono">
                              +{p.members.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEditClick={(task) => {
            setSelectedTask(null);
            // Open editor modal next
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
