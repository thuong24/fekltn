'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) return <div className="p-8 text-center text-indigo-500 animate-pulse font-bold text-lg">Đang tải thông báo...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[var(--text-color)]">Thông báo Sinh viên</h2>
          <p className="text-[var(--text-mutted)] mt-1">Cập nhật những tin tức mới nhất từ hệ thống</p>
        </div>
        <div className="text-sm font-semibold text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
          {notifications.filter(n => !n.isRead).length} Thông báo mới
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-panel p-20 text-center text-[var(--text-mutted)] border-dashed">
             <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth={1.5}/></svg>
             </div>
             <p className="text-xl font-bold">Hộp thư trống</p>
             <p className="text-sm mt-1 opacity-60">Bạn hiện không có thông báo nào mới.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`glass-panel p-6 border-l-4 transition-all hover:scale-[1.01] cursor-pointer ${n.isRead ? 'border-transparent opacity-70' : 'border-emerald-500 shadow-xl shadow-emerald-500/5'}`}
              onClick={() => !n.isRead && markAsRead(n.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${n.type === 'APPROVAL' ? 'badge-success' : n.type === 'DEADLINE' ? 'badge-danger' : 'badge-primary'}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-mutted)]">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text-color)]">{n.title}</h4>
                  <p className="text-[var(--text-mutted)] mt-2 text-sm leading-relaxed">{n.content}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
