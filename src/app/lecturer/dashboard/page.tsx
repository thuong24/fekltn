'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import api from '@/services/api';
import Link from 'next/link';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const { notifications: socketNotifications } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stats are still fetched via API as they are aggregated
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/lecturer/guidance/students');
        if (res.data.success) {
          const regs = res.data.data;
          const pending = regs.filter((r: any) => r.status === 'PENDING_APPROVAL').length;
          const guiding = regs.filter((r: any) => ['APPROVED', 'SUBMITTING', 'SUBMITTED', 'GRADING', 'PASSED'].includes(r.status)).length;
          setStats({ pending, guiding, total: regs.length });
        }
      } catch (error) {
        console.error('Failed to fetch stats');
        setStats({ pending: 0, guiding: 0, total: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const activities = socketNotifications.slice(0, 8);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'REGISTRATION':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
        );
      case 'SUBMISSION':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
        );
      case 'REVISION':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
    }
  };

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 mx-auto rounded-full"></div></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-color)]">Xin chào, {user?.name}!</h2>
        <span className="text-[var(--text-mutted)]">{new Date().toLocaleDateString('vi-VN')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-warning relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
           <p className="text-sm text-[var(--text-mutted)] font-medium tracking-wide uppercase mb-1">Cần Duyệt Hướng Dẫn</p>
           <h3 className="text-4xl font-bold text-amber-500">{stats?.pending || 0}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-indigo-500 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
           <p className="text-sm text-[var(--text-mutted)] font-medium tracking-wide uppercase mb-1">Đang Hướng Dẫn</p>
           <h3 className="text-4xl font-bold text-[var(--text-color)]">{stats?.guiding || 0}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-emerald-500 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
           <p className="text-sm text-[var(--text-mutted)] font-medium tracking-wide uppercase mb-1">Đã Đăng Ký Chuyên Môn</p>
           <h3 className="text-xl font-bold text-emerald-500 mt-2">{user?.major || 'Chưa cập nhật'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Hoạt động gần đây
            </h3>
            <Link href="/lecturer/notifications" className="text-xs text-[var(--accent-color)] font-bold hover:underline">Xem tất cả</Link>
          </div>
          
          <div className="space-y-4">
             {activities.length > 0 ? (
               activities.map((activity) => (
                 <div key={activity.id} className="flex gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 overflow-hidden">
                       <h4 className="text-sm font-bold text-[var(--text-color)] truncate">{activity.title}</h4>
                       <p className="text-xs text-[var(--text-mutted)] line-clamp-2 mt-0.5">{activity.content}</p>
                       <p className="text-[10px] text-[var(--text-mutted)] mt-1.5 flex items-center gap-1 font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {formatRelativeTime(activity.createdAt)}
                       </p>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-10 opacity-50 space-y-3">
                  <div className="w-16 h-16 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm">Bạn chưa có hoạt động nào gần đây.</p>
               </div>
             )}
          </div>
        </div>
        
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v1M12 12v.01M12 16v.01" /></svg>
            Truy cập nhanh
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/lecturer/guidance" className="glass-card p-4 text-center hover:bg-black/5 dark:hover:bg-white/5 group border border-transparent hover:border-[var(--accent-color)]/20 transition-all">
              <div className="w-12 h-12 bg-indigo-500/20 text-[var(--accent-color)] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
               <span className="text-sm font-bold">Quản lý Hướng dẫn</span>
            </Link>
            <Link href="/lecturer/review" className="glass-card p-4 text-center hover:bg-black/5 dark:hover:bg-white/5 group border border-transparent hover:border-purple-500/20 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
               <span className="text-sm font-bold">Chấm Phản biện</span>
            </Link>
            <Link href="/lecturer/council" className="glass-card p-4 text-center hover:bg-black/5 dark:hover:bg-white/5 group border border-transparent hover:border-emerald-500/20 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
               <span className="text-sm font-bold">Hội đồng Bảo vệ</span>
            </Link>
            <Link href="/lecturer/topics" className="glass-card p-4 text-center hover:bg-black/5 dark:hover:bg-white/5 group border border-transparent hover:border-amber-500/20 transition-all">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
               <span className="text-sm font-bold">Gợi ý Đề tài</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
