'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function TBMStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tbm/statistics');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Thống kê & Báo cáo</h2>
        <p className="text-[var(--text-mutted)] mt-1">Tổng quan về tình hình thực hiện KLTN và BCTT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border-l-4 border-indigo-500">
           <p className="text-xs font-bold uppercase text-[var(--text-mutted)]">Tổng Sinh viên</p>
           <h3 className="text-4xl font-black mt-2 text-[var(--text-color)]">{stats?.totalStudents || 0}</h3>
        </div>
        <div className="glass-panel p-6 border-l-4 border-amber-500">
           <p className="text-xs font-bold uppercase text-[var(--text-mutted)]">Đang thực hiện</p>
           <h3 className="text-4xl font-black mt-2 text-[var(--text-color)]">{stats?.activeRegistrations || 0}</h3>
        </div>
        <div className="glass-panel p-6 border-l-4 border-emerald-500">
           <p className="text-xs font-bold uppercase text-[var(--text-mutted)]">Đã hoàn thành</p>
           <h3 className="text-4xl font-black mt-2 text-[var(--text-color)]">{stats?.completedRegistrations || 0}</h3>
        </div>
        <div className="glass-panel p-6 border-l-4 border-red-500">
           <p className="text-xs font-bold uppercase text-[var(--text-mutted)]">Chưa đạt</p>
           <h3 className="text-4xl font-black mt-2 text-[var(--text-color)]">{stats?.failedRegistrations || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Simplified stats summary */}
        <div className="glass-panel p-6">
           <h4 className="font-bold mb-4">Tình hình theo Đợt</h4>
           <div className="space-y-4">
              {stats?.byPeriod?.map((p: any) => (
                <div key={p.periodId} className="flex flex-col gap-2 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--glass-border)] transition-colors">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-semibold truncate max-w-[250px]">{p.periodName}</span>
                     <span className="badge badge-primary">{p.type}</span>
                   </div>
                   <div className="flex gap-4 text-xs font-medium">
                     <span className="text-amber-500">Pending: {p.pendingCount}</span>
                     <span className="text-indigo-500">Guiding: {p.guidingCount}</span>
                     <span className="text-emerald-500">Completed: {p.completedCount}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="glass-panel p-6">
           <h4 className="font-bold mb-4">Gợi ý Hành động</h4>
           <p className="text-sm text-[var(--text-mutted)]">Vui lòng kiểm tra các đợt sắp hết hạn đăng ký để nhắc nhở GV và SV.</p>
           <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-medium text-sm">
             Có {stats?.unassignedCount || 0} đề tài KLTN chưa có hội đồng. Hãy hoàn tất phân công.
           </div>
        </div>
      </div>
    </div>
  );
}
