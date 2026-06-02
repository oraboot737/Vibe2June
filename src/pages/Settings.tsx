/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User as UserIcon,
  Moon,
  Sun,
  Bell,
  Mail,
  Smartphone,
  Save,
  CheckCircle,
  Key
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser, theme, toggleTheme, updateProfile, addToast, locale, setLocale, t } = useApp();

  // local form fields
  const [name, setName] = useState(currentUser ? currentUser.name : '');
  const [email, setEmail] = useState(currentUser ? currentUser.email : '');

  // Mock Notification settings states
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);

  // Sync state if currentUser alters
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast(locale === 'th' ? 'ชื่อที่แสดงในส่วนโปรไฟล์ห้ามเว้นว่าง' : 'Profile display name must be non-empty', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      addToast(locale === 'th' ? 'โปรดระบุที่อยู่อีเมลให้ถูกต้องตามโครงสร้าง' : 'Please input a valid email address structure', 'error');
      return;
    }
    updateProfile(name.trim(), email.trim());
  };

  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(locale === 'th' ? 'บันทึกการตั้งค่าการแจ้งเตือนเสร็จสิ้น!' : 'Notification preferences written successfully!', 'success');
  };

  return (
    <div id="settings-viewport" className="space-y-6 max-w-3xl mr-auto select-none animate-in fade-in duration-200">
      
      {/* Header index */}
      <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs transition-colors">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-845 dark:text-white flex items-center gap-2">
          {t('settings')}
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
          {t('profileSettingsSub')}
        </p>
      </section>

      {/* Main Form Fields Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column profile details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-500" /> {t('personalDetails')}
            </h2>

            <form id="profile-setting-form" onSubmit={handleSaveProfile} className="space-y-4 font-sans text-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-slate-50 dark:bg-slate-950/25 rounded-xl border border-slate-100 dark:border-slate-850/60 mb-2">
                <div className="w-14 h-14 rounded-full bg-blue-105 dark:bg-blue-900 text-blue-700 dark:text-blue-100 text-lg font-bold font-mono border border-blue-200 flex items-center justify-center shadow-inner">
                  {currentUser?.initials || 'TF'}
                </div>
                <div className="space-y-0.5 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentUser?.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-505">Access level: Member Administrator</p>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="settings-name-input" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {t('fullNameLabel')}
                </label>
                <input
                  id="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-201 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="settings-email-input" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {t('emailLabel')}
                </label>
                <input
                  id="settings-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-201 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-3">
                <button
                  id="settings-save-profile"
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('saveChanges')}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Preferences for alerts */}
          <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" /> Notifications sub-center
            </h2>

            <form id="notification-setting-form" onSubmit={handleSaveNotification} className="space-y-4 text-sm text-slate-705 dark:text-slate-300">
              
              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <Mail className="w-4.5 h-4.5 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-slate-800 dark:text-slate-100">Email Overviews</span>
                    <span className="text-xs text-slate-500 block leading-tight">Daily summary schedules of action items & due backlogs.</span>
                  </div>
                </div>
                {/* Standard Toggle Switch */}
                <button
                  id="toggle-email-alerts"
                  type="button"
                  onClick={() => setNotifyEmail(!notifyEmail)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notifyEmail ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-750'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    notifyEmail ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <Bell className="w-4.5 h-4.5 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-slate-800 dark:text-slate-100">In-App Indicators</span>
                    <span className="text-xs text-slate-500 block leading-tight">Overdue badges and timeline update indicators in headers.</span>
                  </div>
                </div>
                <button
                  id="toggle-inapp-alerts"
                  type="button"
                  onClick={() => setNotifyInApp(!notifyInApp)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notifyInApp ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-750'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    notifyInApp ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-4.5 h-4.5 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-slate-800 dark:text-slate-100">Slack & push triggers</span>
                    <span className="text-xs text-slate-500 block leading-tight">Send urgent messages to connected Slack channels instantly.</span>
                  </div>
                </div>
                <button
                  id="toggle-push-alerts"
                  type="button"
                  onClick={() => setNotifyPush(!notifyPush)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notifyPush ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-750'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    notifyPush ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="pt-2">
                <button
                  id="settings-save-notification"
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save')}</span>
                </button>
              </div>

            </form>
          </section>

        </div>

        {/* Right column: Aspect configuration themes mapping */}
        <div className="space-y-6">
          
          <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              {t('themePreference')}
            </h2>
            <div className="grid grid-cols-2 gap-3 pb-1 pt-1 font-sans text-xs">
              
              {/* Light Mode choice */}
              <button
                id="select-theme-light"
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/20 text-blue-600 dark:border-blue-500'
                    : 'border-slate-150 dark:border-slate-800 text-slate-450 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-semibold block">{t('enableLightMode')}</span>
              </button>

              {/* Dark Mode Choice */}
              <button
                id="select-theme-dark"
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-900/15 text-blue-400 dark:border-blue-500'
                    : 'border-slate-150 dark:border-slate-800 text-slate-450 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-semibold block">{t('enableDarkMode')}</span>
              </button>

            </div>
          </section>

          {/* Language Preference Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-3xs">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              {t('languageLabel')}
            </h2>
            <div className="grid grid-cols-2 gap-3 pb-1 pt-1 font-sans text-xs">
              
              {/* English Switcher */}
              <button
                id="select-lang-en"
                type="button"
                onClick={() => {
                  if (locale !== 'en') {
                    setLocale('en');
                    addToast('Language switched to English', 'success');
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                  locale === 'en'
                    ? 'border-blue-600 bg-blue-50/20 text-blue-600 dark:border-blue-500'
                    : 'border-slate-150 dark:border-slate-800 text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xl">🇺🇸</span>
                <span className="font-semibold block">{t('english')}</span>
              </button>

              {/* Thai Switcher */}
              <button
                id="select-lang-th"
                type="button"
                onClick={() => {
                  if (locale !== 'th') {
                    setLocale('th');
                    addToast('เปลี่ยนภาษาเป็นภาษาไทยแล้ว', 'success');
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                  locale === 'th'
                    ? 'border-blue-500 bg-blue-900/15 text-blue-400 dark:border-blue-500'
                    : 'border-slate-150 dark:border-slate-800 text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xl">🇹🇭</span>
                <span className="font-semibold block">{t('thai')}</span>
              </button>

            </div>
          </section>

          {/* Workspace statistics summary cards */}
          <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-555" /> Security assembly
            </h3>
            <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
              <p>Your workspace is compiled on sandbox container. API operations bypass SSL filters automatically for development ease.</p>
              <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
              <div className="flex justify-between font-mono text-[10px]">
                <span>SESSION ID</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">TF-PROV-99x72</span>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
