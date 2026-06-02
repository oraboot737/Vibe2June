/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  Settings as SettingsIcon,
  Star,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Menu,
  Plus
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onCreateProjectClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  setIsOpenMobile,
  isCollapsed,
  setIsCollapsed,
  onCreateProjectClick
}) => {
  const { projects, currentUser, logout, t } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find user's starred projects
  const starredProjectsIds = currentUser?.starredProjects || [];
  const starredProjects = projects.filter(p => starredProjectsIds.includes(p.id));

  // Navigation Links
  const navItems = [
    { key: 'dashboard', name: t('dashboard'), path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: 'projects', name: t('projects'), path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { key: 'settings', name: t('settings'), path: '/settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/40">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-white tracking-tight" onClick={() => setIsOpenMobile(false)}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/20">
            TF
          </div>
          {(!isCollapsed || isOpenMobile) && (
            <span className="text-lg font-semibold tracking-tight text-slate-100">
              Task<span className="text-blue-400">Flow</span>
            </span>
          )}
        </Link>
        {isOpenMobile ? (
          <button
            id="close-sidebar-mobile"
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            id="toggle-sidebar"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-7">
        <div className="space-y-1.5">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              id={`nav-${item.key}`}
              to={item.path}
              onClick={() => setIsOpenMobile(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`
              }
            >
              {item.icon}
              {(!isCollapsed || isOpenMobile) && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Starred / Favorite Projects Section */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 text-xs font-bold text-slate-500 tracking-wider uppercase">
              <span>{t('favorites')}</span>
              <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                {starredProjects.length}
              </span>
            </div>
            {starredProjects.length > 0 ? (
              <div className="space-y-1">
                {starredProjects.map(proj => (
                  <NavLink
                    key={proj.id}
                    id={`fav-proj-${proj.id}`}
                    to={`/project/${proj.id}`}
                    onClick={() => setIsOpenMobile(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color || '#3b82f6' }} />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  </NavLink>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-xs text-slate-500 italic">No starred projects.</div>
            )}
          </div>
        )}

        {/* Active Projects Quick Access */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 text-xs font-bold text-slate-500 tracking-wider uppercase">
              <span>{t('projects')}</span>
              <button
                id="sidebar-new-project"
                onClick={(e) => {
                  e.preventDefault();
                  onCreateProjectClick();
                  setIsOpenMobile(false);
                }}
                className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('createProject')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(proj => (
                <NavLink
                  key={proj.id}
                  id={`sidebar-proj-${proj.id}`}
                  to={`/project/${proj.id}`}
                  onClick={() => setIsOpenMobile(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors truncate ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color || '#3b82f6' }} />
                  <span className="truncate">{proj.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Logout Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/10">
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer ${
            isCollapsed && !isOpenMobile ? 'justify-center' : ''
          }`}
          title={t('signOut')}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!isCollapsed || isOpenMobile) && <span>{t('signOut')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg) */}
      <aside
        id="desktop-sidebar"
        className={`hidden lg:block fixed inset-y-0 left-0 z-20 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-canvas Drawer Backdrop */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-35 bg-slate-950/60 lg:hidden shadow-xl"
        />
      )}

      {/* Mobile Drawer (fixed off-screen by default) */}
      <aside
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 lg:hidden transition-transform duration-300 transform ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
