'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Topbar() {
  const { logout, user } = useAuth();
  const { unreadCount, notifications, markAsRead } = useSocket();
  const [showNotif, setShowNotif] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute notification page link based on user role
  const notifLink = user?.role === 'Student' ? '/student/notifications'
    : user?.role === 'TBM' ? '/lecturer/notifications'
      : '/lecturer/notifications';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <header className="h-[70px] bg-[var(--topbar-bg)] backdrop-blur-md border-b border-[var(--glass-border)] flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
        <div className="flex gap-4">
           <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full"></div>
           <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-[70px] bg-[var(--topbar-bg)] backdrop-blur-md border-b border-[var(--glass-border)] flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-color)]">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-[var(--text-mutted)] hover:text-[var(--accent-color)] dark:hover:text-white dark:hover:bg-white/10 hover:bg-black/5 rounded-full transition-colors relative"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border border-slate-800 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-[var(--accent-color)] dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 hover:bg-black/5 rounded-full transition-colors ml-2"
            title={theme === 'dark' ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notif Dropdown */}
          {showNotif && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)}></div>
              <div className="absolute right-0 mt-2 w-80 glass-panel shadow-2xl z-20 overflow-hidden text-sm">
                <div className="px-4 py-3 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--topbar-bg)]">
                  <h3 className="font-semibold text-[var(--text-color)]">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => markAsRead('all')} className="text-xs text-[var(--accent-color)] hover:opacity-80">
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto bg-[var(--bg-color)]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[var(--text-mutted)]">Không có thông báo nào</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif.id);
                          setShowNotif(false);
                        }}
                        className={`p-4 border-b border-[var(--glass-border)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-indigo-500/10' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-[var(--accent-color)]' : 'bg-transparent'}`}></div>
                          <div>
                            <p className="font-medium text-[var(--text-color)]">{notif.title}</p>
                            <p className="text-[var(--text-mutted)] mt-1 line-clamp-2">{notif.content}</p>
                            <p className="text-xs text-[var(--text-mutted)] mt-2 opacity-70">{new Date(notif.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center border-t border-[var(--glass-border)] bg-[var(--topbar-bg)]">
                  <Link href={notifLink} className="text-indigo-400 hover:text-indigo-300 block py-1">Xem tất cả</Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
