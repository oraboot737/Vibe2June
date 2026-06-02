/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, UserPlus, LogIn, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, signup, addToast } = useApp();
  const navigate = useNavigate();

  // Screen Toggle State ('login' | 'signup')
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Input Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local validation states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    setLoading(true);

    // Simulate network authentication delay
    setTimeout(() => {
      if (mode === 'login') {
        const success = login(email);
        setLoading(false);
        if (success) {
          navigate('/');
        }
      } else {
        // Sign-up checks
        if (!name.trim()) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const success = signup(name.trim(), email);
        setLoading(false);
        if (success) {
          navigate('/');
        }
      }
    }, 700);
  };

  return (
    <div id="auth-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 transition-colors">
      <div className="w-full max-w-md space-y-6">
        
        {/* App Logo Emblem */}
        <div className="flex flex-col items-center gap-2 text-center select-none">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/20">
            TF
          </div>
          <h1 className="text-2xl font-bold dark:text-white tracking-tight mt-2">
            Task<span className="text-blue-600">Flow</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Team Task Workspace & Portfolio Board
          </p>
        </div>

        {/* Authentication Card */}
        <div id="auth-card" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-5">
          <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 id="auth-title" className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {mode === 'login' ? <LogIn className="w-5 h-5 text-blue-500" /> : <UserPlus className="w-5 h-5 text-blue-500" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Enter your credentials to access your workspaces'
                : 'Complete the form to provision your default workspace'}
            </p>
          </div>

          {/* Form alert display error */}
          {error && (
            <div id="auth-error-banner" className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field (needed for signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label htmlFor="auth-name" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  FULL name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g., Anira Wong"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-940 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="auth-email" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                EMAIL ADDRESS
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="anira@taskflow.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-940 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="auth-password" className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  PASSWORD
                </label>
                {mode === 'login' && (
                  <button
                    id="forgot-password"
                    type="button"
                    onClick={() => addToast('Simulated: A password recovery link was sent to your email.', 'info')}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600 focus:outline-none"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-940 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
                required
              />
            </div>

            {/* Password Confirmation (needed for signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label htmlFor="auth-confirm-password" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  CONFIRM PASSWORD
                </label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-940 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
                  required
                />
              </div>
            )}

            {/* Submit Action Button */}
            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span>Establishing session...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to TaskFlow' : 'Launch New Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Screen Mode Links */}
          <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-450">
            {mode === 'login' ? (
              <p>
                First time using TaskFlow?{' '}
                <button
                  id="toggle-to-signup"
                  onClick={() => setMode('signup')}
                  className="font-bold text-blue-500 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  id="toggle-to-login"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-500 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Guest access disclaimer */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-505" />
          <span>Secured Sandbox Environment — Mock Session Session</span>
        </div>

      </div>
    </div>
  );
};
