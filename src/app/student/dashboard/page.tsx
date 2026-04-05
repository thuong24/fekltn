'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { StudentStatus } from '@/types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/student/me/status');
        if (res.data.success) {
          setStatus(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch status', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;
  }

  const renderCurrentStage = () => {
    switch (status?.currentStage) {
      case 'NONE':
        return (
          <div className="glass-card p-6 border-l-4 border-indigo-500 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 text-indigo-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">Chưa đăng ký đề tài</h3>
            <p className="text-[var(--text-mutted)] mb-6">Bạn cần tiến hành đăng ký Báo Cáo Thực Tập (BCTT) để bắt đầu quy trình.</p>
            <a href="/student/register" className="btn-primary">Đăng ký ngay</a>
          </div>
        );
      case 'BCTT':
        return (
          <div className="glass-card p-6 border-l-4 border-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-warning mb-2">Đang thực hiện BCTT</span>
                <h3 className="text-xl font-bold text-[var(--text-color)] mt-1">{status.bcttRegistration?.topicName}</h3>
                <p className="text-[var(--text-mutted)] mt-1">GVHD: {status.bcttRegistration?.lecturer?.name}</p>
              </div>
              <a href="/student/progress" className="btn-secondary text-sm">Xem tiến độ</a>
            </div>
          </div>
        );
      case 'BCTT_PASSED':
        return (
          <div className="glass-card p-6 border-l-4 border-indigo-500 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">Đã hoàn thành BCTT</h3>
            <p className="text-[var(--text-mutted)] mb-6">Chúc mừng! Bạn đã đạt yêu cầu BCTT. Bây giờ bạn có thể đăng ký Khóa Luận Tốt Nghiệp (KLTN).</p>
            <a href="/student/register/kltn" className="btn-primary">Đăng ký KLTN</a>
          </div>
        );
      case 'KLTN':
        return (
          <div className="glass-card p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-primary mb-2">Đang thực hiện KLTN</span>
                <h3 className="text-xl font-bold text-[var(--text-color)] mt-1">{status.kltnRegistration?.topicName}</h3>
                <p className="text-[var(--text-mutted)] mt-1">GVHD: {status.kltnRegistration?.lecturer?.name}</p>
              </div>
              <a href="/student/progress" className="btn-secondary text-sm">Xem tiến độ</a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-color)]">Tổng quan</h2>
        <span className="text-[var(--text-mutted)]">Ngày hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
      </div>

      {/* Info Card */}
      <div className="glass-card p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-color)] mb-1">{user?.name}</h3>
            <div className="flex gap-4 text-sm text-[var(--text-mutted)]">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                MSSV: {user?.mssv}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Chuyên ngành: {user?.major}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Hệ: {user?.heDaoTao}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">Trạng thái Hiện tại</h3>
      {renderCurrentStage()}
    </>
  );
}
