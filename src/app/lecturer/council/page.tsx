'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function LecturerCouncil() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States handling Secretary (ThukyHD) tasks
  const [minutesFiles, setMinutesFiles] = useState<{ [regId: number]: File }>({});
  const [minutesFeedback, setMinutesFeedback] = useState<{ [regId: number]: string }>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCouncils();
  }, []);

  const fetchCouncils = async () => {
    try {
      const res = await api.get('/lecturer/council/students');
      if (res.data.success) {
        setMemberships(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải thông tin hội đồng');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'CTHD': return <span className="badge badge-success border-2 border-emerald-500/20 px-3 py-1 text-[11px] font-bold">Chủ tịch HĐ</span>;
      case 'ThukyHD': return <span className="badge badge-primary border-2 border-indigo-500/20 px-3 py-1 text-[11px] font-bold">Thư ký HĐ</span>;
      case 'TVHD': return <span className="badge border-2 border-[var(--glass-border)] px-3 py-1 text-[11px] font-bold text-[var(--text-mutted)]">Ủy viên HĐ</span>;
      case 'GVPB': return <span className="badge badge-warning border-2 border-amber-500/20 px-3 py-1 text-[11px] font-bold">Phản biện</span>;
      default: return <span className="badge">{role}</span>;
    }
  };

  const handleUploadMinutes = async (reg: any) => {
    const file = minutesFiles[reg.id];
    const feedback = minutesFeedback[reg.id];

    if (!file && !feedback) {
      toast.error('Vui lòng cung cấp ít nhất file Biên bản hoặc Góp ý');
      return;
    }

    setSubmittingId(reg.id);
    const formData = new FormData();
    formData.append('studentEmail', reg.student.email);
    if (feedback) formData.append('councilFeedback', feedback);
    if (file) formData.append('minutesFile', file);

    try {
      await api.post('/lecturer/council/minutes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Lưu biên bản hội đồng thành công!');
      fetchCouncils();
    } catch {
      toast.error('Lỗi khi lưu biên bản');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleApproveRevision = async (reg: any, approved: boolean) => {
    if (!confirm(approved ? 'Bạn xác nhận DUYỆT bản chỉnh sửa này?' : 'Bạn muốn TỪ CHỐI bản chỉnh sửa này?')) return;
    
    setSubmittingId(reg.id);
    try {
      await api.patch('/lecturer/council/revision-approve', {
        registrationId: reg.id,
        approved,
        reason: approved ? undefined : 'Chủ tịch hội đồng không đồng ý bản chỉnh sửa.'
      });
      toast.success(approved ? 'Đã duyệt thành công' : 'Đã từ chối');
      fetchCouncils();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleFinishDefense = async (reg: any) => {
    if (!confirm(`Xác nhận KẾT THÚC BẢO VỆ cho SV ${reg.student.name}? \nSau khi chốt, sinh viên sẽ có thể nộp bản chỉnh sửa.`)) return;
    
    setSubmittingId(reg.id);
    try {
      await api.post('/lecturer/council/finish-defense', { registrationId: reg.id });
      toast.success('Đã kết thúc bảo vệ thành công!');
      fetchCouncils();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi kết thúc bảo vệ');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-indigo-500 animate-pulse font-bold">Đang tải danh sách hội đồng...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-color)]">Hội đồng Bảo vệ</h2>
          <p className="text-[var(--text-mutted)] mt-1">Danh sách Hội đồng bạn được phân công và các sinh viên tham gia bảo vệ.</p>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="glass-panel p-16 text-center text-[var(--text-mutted)]">
          <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 scale-125">
             <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          Hiện tại bạn chưa được phân công vào Hội đồng Bảo vệ nào.
        </div>
      ) : (
        memberships.map((membership, idx) => {
          const council = membership.council;
          return (
            <div key={idx} className="glass-panel overflow-hidden border-2 border-transparent hover:border-emerald-500/20 transition-all duration-300">
              {/* Header Hội Đồng */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-6 border-b border-[var(--glass-border)] flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{council.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--text-mutted)]">
                    {council.diaPoint && <span className="flex items-center gap-1 font-medium bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {council.diaPoint}</span>}
                    {council.defenseDate && <span className="flex items-center gap-1 font-medium bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {new Date(council.defenseDate).toLocaleString('vi-VN')}</span>}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-xs font-bold text-[var(--text-mutted)] uppercase tracking-widest">Vai trò của bạn:</span>
                  {getRoleBadge(membership.role)}
                </div>
              </div>

              {/* Danh sách sinh viên trong hội đồng */}
              <div className="p-6">
                <div className="space-y-6">
                  {council.students?.map((cs: any) => {
                    const reg = cs.registration;
                    const revisionSubmission = reg.submissions?.find((s: any) => s.version === 2);
                    
                    // Tính điểm Final nếu là Thư Ký
                    let finalScoreDisplay = "Chưa có đủ điểm";
                    if (membership.role === 'ThukyHD') {
                      if (reg.scores?.length > 0) {
                        const totalScore = reg.scores.reduce((sum: number, s: any) => sum + (s.totalScore || 0), 0) / reg.scores.length;
                        finalScoreDisplay = `${totalScore.toFixed(2)} (${reg.scores.length} người chấm)`;
                      }
                    }

                    return (
                      <div key={reg.id} className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-[var(--glass-border)] hover:border-emerald-500/30 transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-[var(--text-color)]">{reg.topicName}</h4>
                              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${reg.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-600' : reg.status === 'REVISING' ? 'bg-amber-500/20 text-amber-600' : 'bg-indigo-500/20 text-indigo-600'}`}>{reg.status}</span>
                            </div>
                            <p className="text-sm font-semibold text-[var(--text-mutted)] mb-1">Sinh viên: {reg.student?.name} - {reg.student?.mssv}</p>
                            
                            {/* Nút Chấm điểm Hội đồng */}
                            <div className="mt-3">
                               <a 
                                 href={`/lecturer/grading/${reg.id}?role=${membership.role}`} 
                                 className="btn-primary py-1.5 px-4 text-xs bg-emerald-600 shadow-emerald-500/20 inline-flex items-center gap-2"
                               >
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                 Vào Chấm điểm
                               </a>
                            </div>

                            {/* Download buttons */}
                            <div className="mt-5 flex gap-2">
                              {reg.submissions?.filter((s:any) => s.version===1).map((sub:any) => (
                                <a key={sub.id} href={sub.fileUrl} target="_blank" className="btn-secondary text-xs py-1.5 px-3">📄 Xem Báo cáo KLTN</a>
                              ))}
                              {revisionSubmission?.revisionUrl && <a href={revisionSubmission.revisionUrl} target="_blank" className="btn-secondary text-xs py-1.5 px-3 border-amber-500/50 text-amber-600">📝 Bản Chỉnh Sửa</a>}
                              {revisionSubmission?.giaiTrinhUrl && <a href={revisionSubmission.giaiTrinhUrl} target="_blank" className="btn-secondary text-xs py-1.5 px-3 border-amber-500/50 text-amber-600">💬 Biên Bản Giải Trình</a>}
                            </div>
                          </div>

                          {/* ACTION BLOCKS BASED ON ROLE */}
                          <div className="md:w-1/3 bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-[var(--glass-border)]">
                            
                            {/* Thư Ký UI */}
                             {membership.role === 'ThukyHD' && (
                               <div className="space-y-4">
                                 <div>
                                   <span className="text-[10px] font-bold uppercase text-[var(--text-mutted)] tracking-wider block mb-1">Tổng điểm Hội đồng</span>
                                   <div className="text-xl font-black text-indigo-500">{finalScoreDisplay}</div>
                                 </div>
                                 
                                 {reg.bienban ? (
                                   <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                                     <div className="flex items-center justify-between mb-2">
                                       <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Đã lưu Biên bản ✅</span>
                                     </div>
                                     {reg.bienban.councilFeedback && <p className="text-xs italic text-[var(--text-color)] bg-black/5 dark:bg-white/5 p-2 rounded-md">"{reg.bienban.councilFeedback}"</p>}
                                     {reg.bienban.fileUrl && (
                                       <a href={reg.bienban.fileUrl} target="_blank" className="btn-secondary text-[11px] w-full justify-center py-2 text-emerald-600 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10">
                                         📄 Xem Biên bản PDF/DOC
                                       </a>
                                     )}
                                     <button onClick={() => { reg.bienban = null; setSubmittingId(null); }} className="btn-secondary text-[10px] py-1 mt-2 w-full border-none opacity-60 hover:opacity-100">Chỉnh sửa lại</button>
                                   </div>
                                 ) : (
                                   <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                                     <span className="text-[10px] font-bold uppercase text-[var(--text-mutted)] tracking-wider">Lập Biên bản Hội đồng</span>
                                     <textarea 
                                       className="input-field min-h-[60px] text-xs py-2" 
                                       placeholder="Ghi chú góp ý của Hội đồng..."
                                       value={minutesFeedback[reg.id] || ''}
                                       onChange={e => setMinutesFeedback({...minutesFeedback, [reg.id]: e.target.value})}
                                     />
                                     <input 
                                       type="file" 
                                       accept=".pdf,.doc,.docx"
                                       onChange={e => setMinutesFiles({...minutesFiles, [reg.id]: e.target.files?.[0] as File})}
                                       className="input-field text-[10px] py-1 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" 
                                     />
                                     <button 
                                       onClick={() => handleUploadMinutes(reg)} 
                                       disabled={submittingId === reg.id}
                                       className="btn-primary w-full text-xs py-2 mt-2 bg-indigo-600 shadow-indigo-500/20"
                                     >
                                       Lưu Biên Bản
                                     </button>
                                   </div>
                                 )}
 
                                 <div className="pt-2 border-t border-[var(--glass-border)]">
                                   <button 
                                     onClick={() => handleFinishDefense(reg)} 
                                     disabled={submittingId === reg.id || reg.status === 'REVISING' || reg.status === 'COMPLETED'}
                                     className={`btn-primary w-full text-xs py-2 bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-none font-black ${ (reg.status === 'REVISING' || reg.status === 'COMPLETED') ? 'opacity-50 grayscale' : ''}`}
                                   >
                                     {reg.status === 'REVISING' || reg.status === 'COMPLETED' ? '✓ ĐÃ KẾT THÚC BV' : '🚩 KẾT THÚC BẢO VỆ'}
                                   </button>
                                 </div>
                               </div>
                             )}

                             {/* GV Hướng Dẫn UI - Duyệt bản chỉnh sửa */}
                             {membership.role === 'GVHD' && (
                               <div className="space-y-3">
                                 <span className="text-[10px] font-bold uppercase text-[var(--text-mutted)] tracking-wider block">Duyệt bản chỉnh sửa</span>
                                 {revisionSubmission ? (
                                    revisionSubmission.gvhdApproval === 'PENDING' ? (
                                      <div className="flex gap-2">
                                        <button onClick={() => handleApproveRevision(reg, true)} disabled={submittingId === reg.id} className="flex-1 btn-primary bg-emerald-500 py-2 text-xs">Phê duyệt</button>
                                        <button onClick={() => handleApproveRevision(reg, false)} disabled={submittingId === reg.id} className="flex-1 btn-primary bg-red-500 py-2 text-xs">Từ chối</button>
                                      </div>
                                    ) : (
                                      <div className={`p-3 rounded-lg text-xs font-bold text-center ${revisionSubmission.gvhdApproval === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                        {revisionSubmission.gvhdApproval === 'APPROVED' ? '✓ Bạn đã duyệt' : '✗ Bạn đã từ chối'}
                                      </div>
                                    )
                                 ) : (
                                   <p className="text-xs italic text-[var(--text-mutted)]">Đang chờ sinh viên nộp bài...</p>
                                 )}
                               </div>
                             )}

                            {/* Chủ Tịch UI */}
                            {membership.role === 'CTHD' && (
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-[var(--text-mutted)] tracking-wider block mb-1">Trạng thái GVHD duyệt sửa</span>
                                  <div className="text-sm font-semibold mt-1">
                                    {revisionSubmission ? (
                                      revisionSubmission.gvhdApproval === 'APPROVED' ? <span className="text-emerald-500">✅ GVHD đã duyệt</span>
                                      : revisionSubmission.gvhdApproval === 'REJECTED' ? <span className="text-red-500">❌ GVHD TỪ CHỐI</span>
                                      : <span className="text-amber-500">Đang chờ GVHD duyệt</span>
                                    ) : (
                                      <span className="text-[var(--text-mutted)]">SV chưa nộp bài chỉnh sửa</span>
                                    )}
                                  </div>
                                </div>
                                
                                {revisionSubmission && revisionSubmission.gvhdApproval === 'APPROVED' && revisionSubmission.cthdApproval === 'PENDING' && (
                                  <div className="pt-3 border-t border-[var(--glass-border)] flex gap-2">
                                    <button onClick={() => handleApproveRevision(reg, true)} disabled={submittingId === reg.id} className="flex-1 btn-primary bg-emerald-500 shadow-emerald-500/20 text-xs py-2">Duyệt (Pass)</button>
                                    <button onClick={() => handleApproveRevision(reg, false)} disabled={submittingId === reg.id} className="flex-1 btn-primary bg-red-500 shadow-red-500/20 text-xs py-2">Từ chối</button>
                                  </div>
                                )}
                                {revisionSubmission && revisionSubmission.cthdApproval === 'APPROVED' && (
                                  <div className="pt-3 border-t border-[var(--glass-border)] text-emerald-500 font-bold text-xs flex items-center justify-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Chủ tịch đã duyệt
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Ủy Viên UI - Cơ bản chỉ xem, có thể thêm nút chấm điểm sau nếu gom chung luồng */}
                            {membership.role !== 'CTHD' && membership.role !== 'ThukyHD' && (
                              <div className="h-full flex items-center justify-center text-[10px] text-[var(--text-mutted)] uppercase font-bold tracking-widest text-center opacity-50 border-2 border-dashed border-[var(--glass-border)] rounded-lg p-4">
                                Role của bạn không yêu cầu thao tác riêng ở đây. <br/>Dùng chức năng Chấm điểm nếu bạn là thành viên hội đồng.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!council.students || council.students.length === 0) && (
                    <div className="text-center text-sm font-medium text-[var(--text-mutted)] italic py-4">Chưa có sinh viên nào được gán vào hội đồng này.</div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
