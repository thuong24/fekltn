'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isStudent = user?.role === 'Student';
  const isLecturer = user?.role === 'Lecturer';
  const isTBM = user?.role === 'TBM';

  return (
    <aside className="w-54 bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex flex-col h-screen sticky top-0 transition-all duration-300">
      <div className="p-5 border-b border-[var(--glass-border)]">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
          HCMUTE
        </h2>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto w-full flex flex-col gap-1">
        {/* ================= SV MENU ================= */}
        {isStudent && (
          <>
            <Link href="/student/dashboard" className={`nav-item ${pathname === '/student/dashboard' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Thông tin chung</span>
            </Link>
            <Link href="/student/register" className={`nav-item ${pathname.includes('/student/register') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Đăng ký Đề tài</span>
            </Link>
            <Link href="/student/progress" className={`nav-item ${pathname.includes('/student/progress') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Theo dõi Trạng thái</span>
            </Link>

            <Link href="/student/notifications" className={`nav-item ${pathname.includes('/student/notifications') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Thông báo</span>
            </Link>
          </>
        )}

        {/* ================= GV MENU ================= */}
        {(isLecturer || isTBM) && (
          <>
            <Link href="/lecturer/dashboard" className={`nav-item ${pathname === '/lecturer/dashboard' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Thông tin chung</span>
            </Link>
            <Link href="/lecturer/guidance" className={`nav-item ${pathname.includes('/lecturer/guidance') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Hướng dẫn</span>
            </Link>
            <Link href="/lecturer/review" className={`nav-item ${pathname.includes('/lecturer/review') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Phản biện</span>
            </Link>
            <Link href="/lecturer/council" className={`nav-item ${pathname.includes('/lecturer/council') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Hội đồng</span>
            </Link>
            <Link href="/lecturer/topics" className={`nav-item ${pathname.includes('/lecturer/topics') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Gợi ý Đề tài</span>
            </Link>
            <Link href="/lecturer/notifications" className={`nav-item ${pathname.includes('/lecturer/notifications') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Thông báo</span>
            </Link>
          </>
        )}

        {/* ================= TBM MENU ================= */}
        {isTBM && (
          <>
            <div className="px-6 mt-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quản lý TBM</div>
            <Link href="/tbm/quota" className={`nav-item ${pathname.includes('/tbm/quota') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Quản lý Quota</span>
            </Link>
            <Link href="/tbm/assign" className={`nav-item ${pathname.includes('/tbm/assign') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span>Phân công Phản biện & Hội đồng</span>
            </Link>
            <Link href="/tbm/statistics" className={`nav-item ${pathname.includes('/tbm/statistics') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Thống kê</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold">
            {user?.name?.[0] || user?.email[0].toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-[var(--text-color)] truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-[var(--text-mutted)] capitalize truncate">{user?.role} - {user?.major || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
