/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Star, Plus, FolderKanban, ArrowRight, ClipboardCheck, Compass, Users } from 'lucide-react';

export const ProjectsIndex: React.FC = () => {
  const { projects, tasks, users, currentUser, toggleStarProject } = useApp();
  const navigate = useNavigate();

  const [isOpenCreate, setIsOpenCreate] = useState(false);

  // Read project portfolios and process metadata
  const portfolios = projects.map(proj => {
    const projTasks = tasks.filter(t => t.projectId === proj.id);
    const totalCount = projTasks.length;
    const completedCount = projTasks.filter(t => t.status === 'done').length;
    const pendingCount = totalCount - completedCount;
    const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
    const isStarred = currentUser?.starredProjects?.includes(proj.id) || false;
    const members = users.filter(u => proj.memberIds.includes(u.id));

    return {
      ...proj,
      totalCount,
      completedCount,
      pendingCount,
      completionRate,
      isStarred,
      members
    };
  });

  return (
    <div id="projects-index-view" className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Portfolio Header Section */}
      <section id="portfolio-title-bar" className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs transition-colors gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-845 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-5.5 h-5.5 text-blue-500" /> Board Directory
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
            Manage, customize, and spin up team task-boards for tracking progress.
          </p>
        </div>

        <button
          id="launch-new-board-btn"
          onClick={() => setIsOpenCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Board</span>
        </button>
      </section>

      {/* Boards Grid Cards */}
      <div id="directory-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map(p => (
          <div
            key={p.id}
            id={`directory-project-card-${p.id}`}
            className="group relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between duration-200"
          >
            {/* Colored top bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: p.color }} />

            {/* Top row with name & favorites toggle */}
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors truncate">
                  {p.name}
                </span>
                <button
                  id={`directory-star-btn-${p.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStarProject(p.id);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors"
                >
                  <Star className={`w-4 h-4 ${p.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8 leading-snug">
                {p.description || 'No description established.'}
              </p>
            </div>

            {/* Tasks Summary list figures */}
            <div className="grid grid-cols-3 gap-2 py-4 text-center border-t border-b border-slate-100 dark:border-slate-800 mt-4 font-sans select-none my-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">backlogs</span>
                <span className="text-sm font-bold text-slate-650 dark:text-slate-300 font-mono">{p.pendingCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">completed</span>
                <span className="text-sm font-bold text-slate-650 dark:text-slate-300 font-mono">{p.completedCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">total tasks</span>
                <span className="text-sm font-bold text-slate-650 dark:text-slate-300 font-mono">{p.totalCount}</span>
              </div>
            </div>

            {/* Bottom Row progress rate and member avatar rosters */}
            <div className="pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress</span>
                <span className="text-xs font-bold font-mono" style={{ color: p.color }}>{p.completionRate}% Done</span>
              </div>
              
              {/* Actual styled progress bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${p.completionRate}%`, backgroundColor: p.color }} />
              </div>

              {/* Roster of members and button trigger to enter boards */}
              <div className="flex justify-between items-center pt-1.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {p.members.length > 0 ? (
                    <div className="flex -space-x-1 overflow-hidden">
                      {p.members.map(m => (
                        <div
                          key={m.id}
                          className="w-5 h-5 rounded-full bg-slate-105 dark:bg-slate-800 border border-white dark:border-slate-900 text-[8px] font-bold font-mono text-slate-550 flex items-center justify-center pointer-events-auto"
                          title={m.name}
                        >
                          {m.initials}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium italic">Empty assembly</span>
                  )}
                </div>

                <button
                  id={`enter-project-btn-${p.id}`}
                  onClick={() => navigate(`/project/${p.id}`)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer border border-slate-150 dark:border-slate-800"
                >
                  <span>Open</span> <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {isOpenCreate && (
        <CreateProjectModal onClose={() => setIsOpenCreate(false)} />
      )}

    </div>
  );
};
