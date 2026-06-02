/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment, TaskStatus, TaskPriority } from '../types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_COMMENTS } from '../data/mockData';
import { translations, LanguageCode, TranslationKey } from '../utils/translations';

// Toast interface
export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  currentUser: User | null;
  theme: 'light' | 'dark';
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  toasts: Toast[];
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  // Auth Functions
  login: (email: string) => boolean;
  signup: (name: string, email: string) => boolean;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
  // Task Functions
  createTask: (task: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, targetStatus: TaskStatus) => void;
  // Comment Functions
  addComment: (taskId: string, body: string) => void;
  // Project Functions
  createProject: (name: string, description: string, color: string) => void;
  toggleStarProject: (projectId: string) => void;
  // Toast triggers
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if they exist, otherwise use constants
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tf_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('tf_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('tf_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tf_current_user');
    if (saved) return JSON.parse(saved);
    // Default to u1 (Anira Wong) if not logged in
    const defaultUser = INITIAL_USERS.find(u => u.id === 'u1') || null;
    return defaultUser;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tf_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [locale, setLocale] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('tf_locale');
    return (saved as LanguageCode) || 'en';
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tf_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tf_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tf_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tf_locale', locale);
  }, [locale]);

  // Translation lookup helper
  const t = (key: TranslationKey): string => {
    const dict = translations[locale] || translations['en'];
    return dict[key] || translations['en'][key] || String(key);
  };

  // Toast Helper
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    addToast(`Theme switched to ${theme === 'light' ? 'Dark' : 'Light'} mode`, 'info');
  };

  // Auth implementation
  const login = (email: string): boolean => {
    const cleanedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanedEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      addToast(`Welcome back, ${foundUser.name}!`, 'success');
      return true;
    }
    // For visual prototyping, we allow any other email as a new user with u5 properties if not registered
    const defaultNewUser: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].toUpperCase(),
      email: cleanedEmail,
      avatarUrl: null,
      initials: email.slice(0, 2).toUpperCase(),
      starredProjects: []
    };
    setUsers(prev => [...prev, defaultNewUser]);
    setCurrentUser(defaultNewUser);
    addToast(`Account created for ${cleanedEmail}! Welcome!`, 'success');
    return true;
  };

  const signup = (name: string, email: string): boolean => {
    const cleanedEmail = email.trim().toLowerCase();
    const exists = users.some(u => u.email.toLowerCase() === cleanedEmail);
    if (exists) {
      addToast('An account with this email already exists', 'error');
      return false;
    }
    const initials = name
      .split(' ')
      .map(part => part[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TF';

    const newUser: User = {
      id: 'u_' + Date.now().toString(),
      name,
      email: cleanedEmail,
      avatarUrl: null,
      initials,
      starredProjects: []
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast(`Welcome, ${name}! Your TaskFlow and teams spaces are ready.`, 'success');
    return true;
  };

  const logout = () => {
    const name = currentUser?.name || 'User';
    setCurrentUser(null);
    addToast(`Goodbye, ${name}! You have been signed out.`, 'info');
  };

  const updateProfile = (name: string, email: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const initials = name.split(' ').map(p => p[0] || '').join('').slice(0, 2).toUpperCase() || u.initials;
        return { ...u, name, email, initials };
      }
      return u;
    });
    setUsers(updatedUsers);
    const updatedMe = updatedUsers.find(u => u.id === currentUser.id) || null;
    setCurrentUser(updatedMe);
    addToast('Profile updated successfully!', 'success');
  };

  // Task Actions
  const createTask = (taskData: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't_' + Date.now().toString(),
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    addToast(`Task "${newTask.title.slice(0, 25)}${newTask.title.length > 25 ? '...' : ''}" created successfully!`, 'success');
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setComments(prev => prev.filter(c => c.taskId !== taskId));
    addToast(`Task "${taskToDelete?.title.slice(0, 20)}..." removed.`, 'warning');
  };

  const moveTaskStatus = (taskId: string, targetStatus: TaskStatus) => {
    const prevTask = tasks.find(t => t.id === taskId);
    if (!prevTask) return;
    if (prevTask.status === targetStatus) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: targetStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );

    // Human-friendly status translation
    const statusMap: Record<TaskStatus, string> = {
      todo: 'To Do',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done'
    };
    addToast(`Moved task to "${statusMap[targetStatus]}"`, 'success');
  };

  // Comment Actions
  const addComment = (taskId: string, body: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: 'c_' + Date.now().toString(),
      taskId,
      authorId: currentUser.id,
      body,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);

    // Increment denormalized count
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return { ...t, commentCount: t.commentCount + 1 };
        }
        return t;
      })
    );
  };

  // Project Actions
  const createProject = (name: string, description: string, color: string) => {
    if (!currentUser) return;
    const newProject: Project = {
      id: 'p_' + Date.now().toString(),
      name,
      description,
      color,
      memberIds: [currentUser.id],
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    addToast(`Project "${name}" launched successfully!`, 'success');
  };

  const toggleStarProject = (projectId: string) => {
    if (!currentUser) return;
    const isStarred = currentUser.starredProjects?.includes(projectId);
    const updatedStarred = isStarred
      ? currentUser.starredProjects?.filter(id => id !== projectId) || []
      : [...(currentUser.starredProjects || []), projectId];

    const updatedUser = { ...currentUser, starredProjects: updatedStarred };
    setCurrentUser(updatedUser);

    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, starredProjects: updatedStarred };
        }
        return u;
      })
    );

    addToast(isStarred ? 'Removed project from favorites' : 'Added project to favorites', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        projects,
        tasks,
        comments,
        currentUser,
        theme,
        locale,
        setLocale,
        t,
        toasts,
        globalSearchQuery,
        setGlobalSearchQuery,
        login,
        signup,
        logout,
        updateProfile,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        addComment,
        createProject,
        toggleStarProject,
        addToast,
        removeToast,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
