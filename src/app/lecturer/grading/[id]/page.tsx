'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function LecturerGrading() {
   const { id } = useParams();
   const router = useRouter();
   const searchParams = useSearchParams();
   const roleFromUrl = searchParams.get('role') || 'GVHD';

   const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').split('/api')[0];

   const [registration, setRegistration] = useState<any>(null);
   const [criteria, setCriteria] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [isLocked, setIsLocked] = useState(false);

   // Form State
   const [scores, setScores] = useState<{ [key: string]: number }>({
      tc1: 0, tc2: 0, tc3: 0, tc4: 0, tc5: 0, tc6: 0, tc7: 0, tc8: 0, tc9: 0, tc10: 0
   });
   const [comments, setComments] = useState('');
   const [questions, setQuestions] = useState('');

   useEffect(() => {
      fetchData();
   }, [id]);

   const fetchData = async () => {
      try {
         const [regRes, rubricRes] = await Promise.all([
            api.get(`/lecturer/guidance/registration/${id}`),
            api.get('/lecturer/grading/rubric-template')
         ]);

         setRegistration(regRes.data.data);
         setCriteria(rubricRes.data.data.filter((c: any) => c.scoreType === regRes.data.data.type));

         // Pre-fill existing scores if any
         const existingScore = regRes.data.data.scores?.find((s: any) => s.role === roleFromUrl) || regRes.data.data.scores?.[0];
         if (existingScore) {
            setIsLocked(true);
            setScores({
               tc1: existingScore.tc1 || 0,
               tc2: existingScore.tc2 || 0,
               tc3: existingScore.tc3 || 0,
               tc4: existingScore.tc4 || 0,
               tc5: existingScore.tc5 || 0,
               tc6: existingScore.tc6 || 0,
               tc7: existingScore.tc7 || 0,
               tc8: existingScore.tc8 || 0,
               tc9: existingScore.tc9 || 0,
               tc10: existingScore.tc10 || 0,
            });
            setComments(existingScore.comments || '');
            setQuestions(existingScore.questions || '');
         }
      } catch (error) {
         toast.error('Lỗi khi tải dữ liệu chấm điểm');
      } finally {
         setLoading(false);
      }
   };

   const handleScoreChange = (code: string, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
         setScores(prev => ({ ...prev, [code.toLowerCase()]: 0 }));
         return;
      }

      // Find the criterion to check maxScore
      const criterion = criteria.find(c => c.code.toLowerCase() === code.toLowerCase());
      const max = criterion ? criterion.maxScore : 10;

      if (num < 0) return;
      if (num > max) {
         toast.error(`Điểm tiêu chí ${code} không được vượt quá ${max}`);
         setScores(prev => ({ ...prev, [code.toLowerCase()]: max }));
         return;
      }
      setScores(prev => ({ ...prev, [code.toLowerCase()]: num }));
   };

   const calculateTotal = () => {
      return Object.values(scores).reduce((a, b) => a + b, 0).toFixed(2);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         await api.post('/lecturer/grading/submit', {
            registrationId: id,
            studentId: registration.studentId,
            role: roleFromUrl,
            ...scores,
            comments,
            questions
         });
         toast.success('Lưu điểm thành công!');
         router.back();
      } catch (error) {
         toast.error('Lỗi khi lưu điểm');
      } finally {
         setSubmitting(false);
      }
   };

   if (loading) return <div className="p-8 text-center text-[var(--accent-color)] animate-pulse font-bold">Đang tải dữ liệu chấm điểm...</div>;

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end glass-panel p-10 shadow-2xl border border-[var(--glass-border)] relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10">
               <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="badge badge-primary px-4 py-1.5 text-xs">{registration.type}</span>
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 text-[11px] font-black rounded-full uppercase">Vai trò: {roleFromUrl}</span>
                  <span className="text-[10px] font-black text-[var(--text-mutted)] uppercase tracking-[0.2em] ml-2">{registration.period?.dot}</span>
               </div>
               <h2 className="text-4xl font-black tracking-tight text-[var(--text-color)] leading-tight">{registration.topicName}</h2>
               <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-3 p-2 pr-6 bg-black/5 dark:bg-white/5 rounded-full border border-[var(--glass-border)]">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
                        {registration.student?.name[0]}
                     </div>
                     <div>
                        <p className="font-black text-[var(--text-color)] leading-none mb-1">{registration.student?.name}</p>
                        <p className="text-[10px] text-[var(--text-mutted)] uppercase font-bold tracking-wider">MSSV: {registration.student?.mssv}</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="text-right mt-6 md:mt-0 relative z-10">
               <p className="text-[10px] font-black text-[var(--text-mutted)] uppercase tracking-widest mb-1">Tổng điểm hiện tại</p>
               <h3 className="text-6xl font-black text-[var(--accent-color)] drop-shadow-sm">{calculateTotal()}</h3>
            </div>
         </div>

         {registration.type === 'KLTN' && !registration.councilEntry && (
            <div className="glass-panel p-6 border-l-4 border-red-500 bg-red-500/5 animate-pulse">
               <div className="flex items-center gap-4 text-red-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                     <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Chưa thể chấm điểm!</h3>
                     <p className="text-sm">Sinh viên này chưa được Trưởng bộ môn phân công vào Hội đồng bảo vệ. Theo quy định, việc chấm điểm KLTN chỉ được thực hiện sau khi đã có quyết định thành lập hội đồng.</p>
                  </div>
               </div>
            </div>
         )}

         <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="glass-panel p-8 space-y-6">
                  <h3 className="text-xl font-bold border-b border-[var(--glass-border)] pb-4 flex items-center gap-2">
                     <svg className="w-6 h-6 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth={2} /></svg>
                     Bảng tiêu chí đánh giá (Rubric)
                  </h3>

                  {/* Tệp sinh viên nộp */}
                  {registration.submissions && registration.submissions.length > 0 && (
                     <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-indigo-500/20 mb-6 group transition-all hover:bg-indigo-500/10">
                        <h4 className="font-bold text-[var(--accent-color)] flex items-center gap-2 uppercase tracking-wider text-xs mb-4">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>
                           Danh sách tài liệu sinh viên đã nộp
                        </h4>
                        <div className="space-y-4">
                           {[...registration.submissions].sort((a, b) => b.version - a.version).map((sub: any) => (
                              <div key={sub.id} className="flex flex-col md:flex-row justify-between gap-4 p-3 bg-white dark:bg-[var(--glass-card)] rounded-xl border border-[var(--glass-border)]">
                                 <div>
                                    <p className="text-[11px] font-bold text-[var(--accent-color)] uppercase">Tài liệu {sub.version}: {sub.version === 2 ? 'Bản chỉnh sửa sau bảo vệ' : 'Bản nộp chính thức'}</p>
                                    <p className="text-[10px] text-[var(--text-mutted)] mt-0.5">{new Date(sub.createdAt).toLocaleString('vi-VN')}</p>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {(sub.fileUrl || sub.revisionUrl) && (
                                       <div className="flex gap-1 p-1 bg-white dark:bg-slate-50 rounded-lg border border-indigo-500/20">
                                          <span className="text-[9px] self-center px-2 font-bold text-[var(--accent-color)] uppercase">Bài làm</span>
                                          <a href={`${SERVER_URL}${sub.fileUrl || sub.revisionUrl}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-secondary text-[9px] py-1 px-2 border-none bg-indigo-500/10 text-[var(--accent-color)] font-bold">Xem</a>
                                          <a href={`${SERVER_URL}${sub.fileUrl || sub.revisionUrl}`} download className="btn-primary text-[9px] py-1 px-2 bg-indigo-500 shadow-none border-none font-bold">Tải về</a>
                                       </div>
                                    )}
                                    {sub.fileConfirmUrl && (
                                       <div className="flex gap-1 p-1 bg-white dark:bg-slate-50 rounded-lg border border-emerald-500/20">
                                          <span className="text-[9px] self-center px-2 font-bold text-emerald-500 uppercase">Xác nhận</span>
                                          <a href={`${SERVER_URL}${sub.fileConfirmUrl}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-secondary text-[9px] py-1 px-2 border-none bg-emerald-500/10 text-emerald-600 font-bold">Xem</a>
                                          <a href={`${SERVER_URL}${sub.fileConfirmUrl}`} download className="btn-primary text-[9px] py-1 px-2 bg-emerald-500 shadow-none border-none font-bold">Tải về</a>
                                       </div>
                                    )}
                                    {sub.giaiTrinhUrl && (
                                       <div className="flex gap-1 p-1 bg-white dark:bg-slate-50 rounded-lg border border-amber-500/20">
                                          <span className="text-[9px] self-center px-2 font-bold text-amber-500 uppercase">Giải trình</span>
                                          <a href={`${SERVER_URL}${sub.giaiTrinhUrl}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-secondary text-[9px] py-1 px-2 border-none bg-amber-500/10 text-amber-600 font-bold">Xem</a>
                                          <a href={`${SERVER_URL}${sub.giaiTrinhUrl}`} download className="btn-primary text-[9px] py-1 px-2 bg-amber-500 shadow-none border-none font-bold">Tải về</a>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="space-y-4">
                     {criteria.map((c: any) => (
                        <div key={c.id} className="flex gap-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] hover:bg-black/10 transition-colors">
                           <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                              {c.code}
                           </div>
                           <div className="flex-1">
                              <h4 className="font-bold text-[var(--text-color)]">{c.name}</h4>
                              <p className="text-xs text-[var(--text-mutted)] mt-1">{c.description}</p>
                           </div>
                           <div className="w-24 shrink-0">
                              <input
                                 type="number"
                                 step="0.1"
                                 min="0"
                                 max="10"
                                 disabled={isLocked}
                                 value={scores[c.code.toLowerCase()] || 0}
                                 onChange={(e) => handleScoreChange(c.code, e.target.value)}
                                 className={`input-field text-center font-bold text-lg py-2 focus:ring-indigo-500 ${isLocked ? 'cursor-not-allowed opacity-70 bg-black/5 dark:bg-white/5 border-none' : ''}`}
                              />
                              <p className="text-[10px] text-center mt-1 text-[var(--text-mutted)]">Max: {c.maxScore}</p>
                           </div>
                        </div>
                     ))}
                     {criteria.length === 0 && <div className="text-center py-10 text-[var(--text-mutted)] italic">Không tìm thấy tiêu chí phù hợp.</div>}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="glass-panel p-8 space-y-6 sticky top-24">
                  <div className="space-y-4">
                     <h4 className="font-bold text-sm uppercase tracking-widest text-[var(--text-mutted)]">Nhận xét & Câu hỏi</h4>
                     <div className="space-y-2">
                        <label className="text-xs font-bold italic">Câu hỏi bảo vệ/phản biện</label>
                        <textarea
                           value={questions}
                           onChange={(e) => setQuestions(e.target.value)}
                           placeholder="Nhập các câu hỏi cho sinh viên..."
                           disabled={isLocked}
                           className={`input-field h-32 text-sm ${isLocked ? 'opacity-70 bg-black/5 cursor-not-allowed border-none' : ''}`}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold italic">Nhận xét chung</label>
                        <textarea
                           value={comments}
                           onChange={(e) => setComments(e.target.value)}
                           placeholder="Nhận xét về quá trình thực hiện..."
                           disabled={isLocked}
                           className={`input-field h-32 text-sm ${isLocked ? 'opacity-70 bg-black/5 cursor-not-allowed border-none' : ''}`}
                        />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--glass-border)]">
                     {!isLocked ? (
                        <button
                           type="submit"
                           disabled={submitting || (registration.type === 'KLTN' && !registration.councilEntry)}
                           className={`btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-500/20 ${(registration.type === 'KLTN' && !registration.councilEntry) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                           {submitting ? 'Đang lưu...' : (registration.type === 'KLTN' && !registration.councilEntry) ? 'Bị chặn chấm điểm' : 'Lưu & Hoàn tất'}
                        </button>
                     ) : (
                        <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-4 rounded-xl text-center font-bold text-lg flex justify-center items-center gap-2">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                           Đã Khóa Điểm ({calculateTotal()})
                        </div>
                     )}
                     <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full mt-3 text-sm text-[var(--text-mutted)] hover:text-[var(--accent-color)] py-2 transition-colors"
                     >
                        {isLocked ? 'Quay lại' : 'Hủy bỏ'}
                     </button>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
