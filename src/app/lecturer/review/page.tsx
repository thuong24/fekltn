'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LecturerReview() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/lecturer/grading/list?role=GVPB');
      setReviews(res.data.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      toast.error('Lỗi khi tải danh sách phản biện');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-indigo-500 animate-pulse font-bold">Đang tải danh sách phản biện...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-color)]">Phản biện Đề tài</h2>
          <p className="text-[var(--text-mutted)] mt-1">Danh sách sinh viên được phân công phản biện</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center text-[var(--text-mutted)]">
             <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2}/></svg>
             </div>
             Không có đề tài nào cần phản biện.
          </div>
        ) : (
          reviews.map((reg) => (
            <div key={reg.id} className="glass-panel p-6 border-l-4 border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-xl font-bold text-[var(--text-color)] group-hover:text-indigo-500 transition-colors">{reg.topicName}</h3>
                   <p className="text-sm text-[var(--text-mutted)] mt-1">SV: {reg.student.name} - {reg.student.mssv}</p>
                 </div>
                 <span className={`badge ${reg.defenseEnd ? 'badge-success' : 'badge-primary'}`}>
                   {reg.defenseEnd ? 'Đã phản biện' : 'Chờ phản biện'}
                 </span>
              </div>
              
              <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-xs text-[var(--text-mutted)] font-bold uppercase tracking-wider">
                   <span>Giảng viên hướng dẫn:</span>
                   <span className="text-indigo-500">{reg.lecturer?.name || 'Không xác định'}</span>
                 </div>
                 <div className="flex justify-between text-xs text-[var(--text-mutted)] font-bold uppercase tracking-wider">
                   <span>Ngày nộp bài cuối:</span>
                   <span>{reg.submissions?.[0] ? new Date(reg.submissions[0].createdAt).toLocaleDateString('vi-VN') : 'Chưa nộp'}</span>
                 </div>
              </div>

              <div className="flex gap-2 justify-end">
                {reg.submissions?.[0]?.fileUrl && (
                  <a href={reg.submissions[0].fileUrl} target="_blank" className="btn-secondary text-xs px-4 py-2 border border-slate-200 dark:border-slate-700">Xem BCTT/KLTN</a>
                )}
                <Link href={`/lecturer/grading/${reg.id}?role=GVPB`} className="btn-primary flex items-center justify-center text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 shadow-lg">
                  Nhập điểm GVPB
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
