/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bgColor = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100';
        let icon = <Info className="w-5 h-5 text-blue-500" />;
        let borderColor = 'border-slate-200 dark:border-slate-700';

        switch (toast.type) {
          case 'success':
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            borderColor = 'border-emerald-500/20';
            break;
          case 'warning':
            icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            borderColor = 'border-amber-500/20';
            break;
          case 'error':
            icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
            borderColor = 'border-rose-500/20';
            break;
          case 'info':
            icon = <Info className="w-5 h-5 text-blue-500" />;
            borderColor = 'border-blue-500/20';
            break;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 pointer-events-auto ${bgColor} ${borderColor}`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              id={`close-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
