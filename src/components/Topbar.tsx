/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Plus, Bell, Sun, Moon, LogOut, Settings, User as UserIcon, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  onAddTaskClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onAddTaskClick }) => {
  const {
    currentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
    theme,
    toggleTheme,
    logout,
    tasks
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGlobalSearchQuery(val);
    if (val.trim() !== '') {
      if (location.pathname !== '/search') {
        navigate('/search');
      }
    } else if (location.pathname === '/search') {
      // If cleared, go back to dashboard
      navigate('/');
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Pre-calculate overdue items assigned to user for mock notifications count
  const myOverdueTasks = tasks.filter(t => {
    if (t.assigneeId !== currentUser?.id) return false;
    if (t.status === 'done') return false;
    const deadlineDate = new Date(t.dueDate);
    const today = new Date('2026-06-02'); // Mock date from current local time anchor
    return deadlineDate < today;
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Off-canvas menu toggle (Mobile/Tablet and small screens) */}
      <div className="flex items-center gap-4">
        <button
          id="mobile-drawer-toggle"
          onClick={onMenuClick}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none transition-colors"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar (expanding width on mid and high viewports) */}
        <div className="relative w-48 sm:w-64 md:w-80 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            id="global-search"
            type="search"
            placeholder="Search tasks across boards..."
            value={globalSearchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-55 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Primary Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Quick Add Task Button */}
        <button
          id="topbar-add-task-btn"
          onClick={onAddTaskClick}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* Visual Settings: Dark Mode Toggle */}
        <button
          id="theme-toggler"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Alert Notifications Center (Showing Overdue counter) */}
        <div className="relative">
          <button
            id="notifications-bell"
            onClick={() => {
              if (myOverdueTasks.length > 0) {
                navigate('/');
                // Just scroll or highlight a task
              } else {
                navigate('/');
              }
            }}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {myOverdueTasks.length > 0 && (
              <span id="alerts-badge" className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Current User Profiles Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-profile-menu-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-full p-1"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold font-mono shadow-sm">
              {currentUser?.initials || 'ME'}
            </div>
          </button>

          {dropdownOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 text-slate-700 dark:text-slate-200 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
            >
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-semibold tracking-wide">SIGNED IN AS</p>
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-white mt-0.5">{currentUser?.name}</p>
                <p className="text-xs truncate text-slate-500 mt-0.5">{currentUser?.email}</p>
              </div>
              <button
                id="dropdown-goto-profile"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                id="dropdown-goto-settings"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-750 border-b border-slate-100 dark:border-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
              <button
                id="dropdown-signout"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
