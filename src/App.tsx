/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastContainer } from './components/Toast';
import { CreateEditTaskModal } from './components/CreateEditTaskModal';
import { CreateProjectModal } from './components/CreateProjectModal';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectsIndex } from './pages/ProjectsIndex';
import { ProjectView } from './pages/ProjectView';
import { SearchResults } from './pages/SearchResults';
import { Settings } from './pages/Settings';

// Inner component to handle authenticated layout framework
const AppContent: React.FC = () => {
  const { currentUser, theme } = useApp();

  // Responsive Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Quick Action Modal states triggered globally from topbar header
  const [showQuickAddTask, setShowQuickAddTask] = useState(false);
  const [showQuickCreateProject, setShowQuickCreateProject] = useState(false);

  // Path protection: if user session doesn't exist, force Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors font-sans selection:bg-blue-500 selection:text-white`}>
      
      {/* Sidebar navigation controls (fixed width left pane) */}
      <Sidebar
        isOpenMobile={sidebarOpenMobile}
        setIsOpenMobile={setSidebarOpenMobile}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        onCreateProjectClick={() => setShowQuickCreateProject(true)}
      />

      {/* Main responsive scrolling canvas */}
      <div
        id="main-stage-container"
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
        }`}
      >
        {/* Topbar controls header */}
        <Topbar
          onMenuClick={() => setSidebarOpenMobile(true)}
          onAddTaskClick={() => setShowQuickAddTask(true)}
        />

        {/* Content canvas viewport */}
        <main id="primary-scroll-canvas" className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsIndex />} />
            <Route path="/project/:projectId" element={<ProjectView />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/settings" element={<Settings />} />
            {/* Redirect any other path to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Add Task Modal Overlay */}
      {showQuickAddTask && (
        <CreateEditTaskModal
          onClose={() => setShowQuickAddTask(false)}
        />
      )}

      {/* Global Quick Create Board Modal Overlay */}
      {showQuickCreateProject && (
        <CreateProjectModal
          onClose={() => setShowQuickCreateProject(false)}
        />
      )}

      {/* Dynamic Toast overlays container */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
