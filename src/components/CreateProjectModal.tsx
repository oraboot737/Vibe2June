/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Palette, AlertCircle } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
}

const COLOR_TEMPLATES = [
  '#2563EB', // blue
  '#7C3AED', // violet
  '#0891B2', // cyan
  '#16A34A', // emerald
  '#DB2777', // pink
  '#EA580C', // orange
  '#4F46E5', // indigo
  '#DC2626'  // red
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
  const { createProject, addToast } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_TEMPLATES[0]);
  const [error, setError] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project name is required');
      nameInputRef.current?.focus();
      return;
    }

    createProject(name.trim(), description.trim(), selectedColor);
    onClose();
  };

  return (
    <div
      id="modal-project-form-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-all"
      onClick={onClose}
    >
      <div
        id="modal-project-form-panel"
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <h3 id="project-modal-header" className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-500" /> Spawn New Board
          </h3>
          <button
            id="project-form-close"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-850 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Project Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="project-name-input" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              PROJECT name (REQUIRED)
            </label>
            <input
              ref={nameInputRef}
              id="project-name-input"
              type="text"
              placeholder="e.g., Marketing Campaign, Product v3"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans ${
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
              }`}
            />
            {error && (
              <span id="project-name-error" className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </span>
            )}
          </div>

          {/* Project Description Field */}
          <div className="space-y-1.5">
            <label htmlFor="project-desc-input" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              DESCRIPTION
            </label>
            <textarea
              id="project-desc-input"
              rows={3}
              placeholder="Outline objectives, timelines, and primary metrics for this board..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-3xs font-sans"
            />
          </div>

          {/* Accent Color Chooser Theme Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              ACCENT COLOR THEME
            </span>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {COLOR_TEMPLATES.map(color => (
                <button
                  key={color}
                  id={`project-color-btn-${color}`}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-transform relative focus:outline-none flex-shrink-0 duration-150 ${
                    selectedColor === color ? 'ring-3 ring-blue-505 dark:ring-blue-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {selectedColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
            <button
              id="project-form-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-350 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="project-form-submit"
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/15 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              Launch Board
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
