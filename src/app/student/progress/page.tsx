'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Registration } from '@/types';
import toast from 'react-hot-toast';

export default function StudentProgress() {
  const [bctt, setBctt] = useState<Registration[]>([]);
  const [kltn, setKltn] = useState<Registration | null>(null);
  const [rubric, setRubric] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').split('/api')[0];

  // Submission States
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [files, setFiles] = useState<{ [regId: number]: { report?: File, confirm?: File, revision?: File, explanation?: File } }>({});

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [bcttRes, kltnRes, rubricRes] = await Promise.all([
        api.get('/student/registrations/bctt/me'),
        api.get('/student/registrations/kltn/me'),
        api.get('/student/rubric-template')
      ]);
      if (bcttRes.data.success) setBctt(bcttRes.data.data);
      if (kltnRes.data.success) setKltn(kltnRes.data.data);
      if (rubricRes.data.success) setRubric(rubricRes.data.data);
    } catch (error) {
      toast.error('Không thể lấy thông tin tiến độ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (regId: number, field: string, file: File | undefined) => {
    setFiles(prev => ({
      ...prev,
      [regId]: { ...prev[regId], [field]: file }
    }));
  };

  const handleSubmitBCTT = async (regId: number) => {
    const regFiles = files[regId];
    if (!regFiles?.report || !regFiles?.confirm) {
      toast.error('Vui lòng chọn cả Báo cáo và Phiếu xác nhận');
      return;
    }
    setSubmitting(regId);
    const formData = new FormData();
    formData.append('registrationId', regId.toString());
    formData.append('bcttFile', regFiles.report);
    formData.append('confirmFile', regFiles.confirm);

    try {
      await api.post('/student/submissions/bctt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Nộp bài BCTT thành công!');
      fetchProgress();
    } catch (error) {
      toast.error('Lỗi khi nộp bài');
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitKLTN = async (regId: number) => {
    const regFiles = files[regId];
    if (!regFiles?.report) {
      toast.error('Vui lòng chọn tệp Báo cáo KLTN');
      return;
    }
    setSubmitting(regId);
    const formData = new FormData();
    formData.append('registrationId', regId.toString());
    formData.append('kltnFile', regFiles.report);

    try {
      await api.post('/student/submissions/kltn', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Nộp bài KLTN thành công!');
      fetchProgress();
    } catch (error) {
      toast.error('Lỗi khi nộp bài');
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitRevision = async (regId: number) => {
    const regFiles = files[regId];
    if (!regFiles?.revision || !regFiles?.explanation) {
      toast.error('Vui lòng chọn cả bài chỉnh sửa và biên bản giải trình');
      return;
    }
    setSubmitting(regId);
    const formData = new FormData();
    formData.append('registrationId', regId.toString());
    formData.append('revisionFile', regFiles.revision);
    formData.append('giaiTrinhFile', regFiles.explanation);

    try {
      await api.post('/student/submissions/kltn/revision', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Nộp bài chỉnh sửa thành công!');
      fetchProgress();
    } catch (error) {
      toast.error('Lỗi khi nộp bài chỉnh sửa');
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return <span className="badge badge-warning">Chờ GV duyệt</span>;
      case 'APPROVED': return <span className="badge badge-primary">Đã duyệt hướng dẫn</span>;
      case 'REJECTED': return <span className="badge badge-danger">Từ chối hướng dẫn</span>;
      case 'SUBMITTING': return <span className="badge badge-primary">Đang nộp bài</span>;
      case 'SUBMITTED': return <span className="badge badge-success">Đã nộp bài</span>;
      case 'GRADING': return <span className="badge badge-warning">Đang chấm điểm</span>;
      case 'PASSED': return <span className="badge badge-success">Đạt</span>;
      case 'FAILED': return <span className="badge badge-danger">Không đạt</span>;
      case 'DEFENDING': return <span className="badge badge-warning">Chờ bảo vệ</span>;
      case 'POST_DEFENSE': return <span className="badge badge-primary">Đã bảo vệ xong</span>;
      case 'REVISING': return <span className="badge badge-warning">Đang chỉnh sửa sau BV</span>;
      case 'COMPLETED': return <span className="badge badge-success">Hoàn thành</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const RenderScoreDetails = ({ reg }: { reg: any }) => {
    const allScores: any[] = reg.scores || [];
    const [activeScoreId, setActiveScoreId] = useState<number | null>(allScores[0]?.id || null);

    if (allScores.length === 0) return null;

    const currentRubric = rubric.filter((r: any) => r.scoreType === reg.type);
    const selectedScore = allScores.find(s => s.id === activeScoreId) || allScores[0];

    return (
      <div className="mt-4 p-5 bg-white/30 dark:bg-slate-800/50 rounded-2xl border border-indigo-200/50 dark:border-slate-700 space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--glass-border)] pb-3 mb-2">
          <h5 className="text-sm font-bold text-[var(--accent-color)] dark:text-indigo-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
            Kết quả đánh giá chi tiết
          </h5>
          <div className="flex gap-1 overflow-x-auto pb-1 max-w-[60%]">
            {allScores.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveScoreId(s.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${activeScoreId === s.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-black/5 dark:bg-white/5 text-[var(--text-mutted)] hover:bg-indigo-500/10'}`}
              >
                {s.grader?.name} ({s.role})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Score Info */}
        <div className="flex justify-between items-end bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-indigo-500/10 mb-4">
          <div>
            <p className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest">Đang xem điểm của</p>
            <h6 className="font-bold text-sm">{selectedScore.grader?.name} - {selectedScore.role}</h6>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest">Tổng điểm</p>
            <p className="text-xl font-black text-[var(--accent-color)]">{selectedScore.totalScore?.toFixed(2)}</p>
          </div>
        </div>

        {/* Score breakdown by criteria */}
        {currentRubric.length > 0 && (
          <div className="space-y-1.5 px-2">
            {currentRubric.map((c: any) => {
              const val = selectedScore[c.code.toLowerCase()] ?? '-';
              const pct = c.maxScore > 0 && val !== '-' ? (val / c.maxScore) * 100 : 0;
              return (
                <div key={c.id} className="flex justify-between items-center text-xs py-1.5 gap-4 hover:bg-black/5 rounded-lg px-2 transition-colors">
                  <span className="text-[var(--text-mutted)] flex-1 truncate" title={c.name}>{c.code}: {c.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="font-bold w-12 text-right">{val !== '-' ? `${val}/${c.maxScore}` : '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comments from selected Grader */}
        {selectedScore.comments && (
          <div className="p-4 bg-amber-500/5 rounded-xl text-xs italic text-[var(--text-mutted)] border border-amber-500/10 mt-2">
            <p className="font-bold not-italic text-amber-600 mb-1 flex items-center gap-1">
              Nhận xét:
            </p>
            "{selectedScore.comments}"
          </div>
        )}

        {/* Final Average Score Summary if multiple */}
        {allScores.length > 1 && (
          <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--glass-border)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">Tóm tắt điểm Hội đồng</span>
              <span className="text-[10px] text-[var(--text-mutted)] uppercase font-bold">{allScores.length} người đã chấm</span>
            </div>

            <div className="flex justify-between items-end bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
              <div>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">ĐIỂM TRUNG BÌNH (FINAL)</p>
                <p className="text-3xl font-black">{(allScores.reduce((sum, s) => sum + (s.totalScore || 0), 0) / allScores.length).toFixed(2)}</p>
              </div>
              <div className="text-right">
                {reg.status === 'PASSED' ? (
                  <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg> ĐẠT KẾT QUẢ</div>
                ) : reg.status === 'FAILED' ? (
                  <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">❌ CHƯA ĐẠT</div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full animate-pulse">⏳ ĐANG XỬ LÝ</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center text-[var(--accent-color)] animate-pulse font-bold">Đang tải tiến độ...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-[var(--text-color)]">Tiến độ thực hiện</h2>
        <p className="text-[var(--text-mutted)] mt-1">Nộp báo cáo và theo dõi kết quả đánh giá</p>
      </div>

      {/* BCTT Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[var(--accent-color)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>
          </div>
          <h3 className="text-xl font-bold">Thực tập (BCTT)</h3>
        </div>
        {bctt.map((reg) => (
          <div key={reg.id} className="glass-panel p-6 border-l-4 border-indigo-500 group">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">{reg.period?.dot}</span>
                  {getStatusBadge(reg.status)}
                </div>
                <h4 className="text-xl font-bold text-[var(--text-color)]">{reg.topicName}</h4>
                <p className="text-sm text-[var(--text-mutted)] mt-1">GVHD: {reg.lecturer?.name}</p>
              </div>
              <div className="text-right text-xs text-[var(--text-mutted)]">Đăng ký ngày: {new Date(reg.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>

            {/* Score Details for BCTT */}
            <RenderScoreDetails reg={reg} />

            {/* Submission UI for BCTT */}
            {['APPROVED', 'SUBMITTING', 'SUBMITTED', 'REJECTED'].includes(reg.status) && (
              reg.submissions && reg.submissions.length > 0 && reg.status !== 'REJECTED' ? (
                <div className="mt-6 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                  <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--accent-color)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Đã Nộp Bài BCTT
                  </h5>
                  <div className="flex gap-4">
                    {reg.submissions[0].fileUrl && <a href={`${SERVER_URL}${reg.submissions[0].fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs border-indigo-500/30 text-[var(--accent-color)] px-3 py-1.5">📄 Báo cáo (PDF)</a>}
                    {reg.submissions[0].fileConfirmUrl && <a href={`${SERVER_URL}${reg.submissions[0].fileConfirmUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs border-indigo-500/30 text-[var(--accent-color)] px-3 py-1.5">📄 Phiếu xác nhận (PDF)</a>}
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] space-y-6">
                  <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--accent-color)]">Cổng nộp bài BCTT</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-mutted)]">1. Tệp báo cáo (PDF)</label>
                      <input type="file" accept=".pdf" onChange={(e) => handleFileChange(reg.id, 'report', e.target.files?.[0])} className="input-field py-1.5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-mutted)]">2. Phiếu xác nhận (PDF)</label>
                      <input type="file" accept=".pdf" onChange={(e) => handleFileChange(reg.id, 'confirm', e.target.files?.[0])} className="input-field py-1.5" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSubmitBCTT(reg.id)}
                      disabled={submitting === reg.id}
                      className="btn-primary"
                    >
                      {reg.status === 'SUBMITTED' ? 'Nộp lại bài' : 'Xác nhận Nộp bài'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </section>

      {/* KLTN Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth={2} /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth={2} /></svg>
          </div>
          <h3 className="text-xl font-bold">Khóa luận (KLTN)</h3>
        </div>
        {kltn ? (
          <div className="glass-panel p-6 border-l-4 border-emerald-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">{(kltn as any).period?.dot}</span>
                  {getStatusBadge((kltn as any).status)}
                </div>
                <h4 className="text-xl font-bold text-[var(--text-color)]">{(kltn as any).topicName}</h4>
                <p className="text-sm text-[var(--text-mutted)] mt-1">GVHD: {(kltn as any).lecturer?.name}</p>
              </div>
            </div>

            {/* Council Info Block */}
            {(kltn as any).councilEntry?.council ? (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                <h5 className="text-sm font-bold text-emerald-500 flex items-center gap-2 uppercase tracking-widest">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Thông tin Hội đồng Bảo vệ
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[var(--text-mutted)] uppercase">Tên hội đồng</p>
                    <p className="font-bold mt-0.5">{(kltn as any).councilEntry.council.name}</p>
                  </div>
                  {(kltn as any).councilEntry.council.diaPoint && (
                    <div>
                      <p className="text-xs text-[var(--text-mutted)] uppercase">Địa điểm</p>
                      <p className="font-bold mt-0.5">{(kltn as any).councilEntry.council.diaPoint}</p>
                    </div>
                  )}
                  {(kltn as any).councilEntry.council.defenseDate && (
                    <div className="col-span-2">
                      <p className="text-xs text-[var(--text-mutted)] uppercase">Ngày & Giờ bảo vệ</p>
                      <p className="font-bold mt-0.5 text-emerald-500">{new Date((kltn as any).councilEntry.council.defenseDate).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                  )}
                </div>
                {(kltn as any).councilEntry.council.members?.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-mutted)] uppercase mb-2">Thành phần Hội đồng</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(kltn as any).councilEntry.council.members.map((m: any) => {
                        const roleLabel: Record<string, string> = {
                          CTHD: 'Chủ tịch', ThukyHD: 'Thư ký', TVHD: 'Thành viên', GVPB: 'Phản biện', GVHD: 'Hướng dẫn'
                        };
                        return (
                          <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-emerald-500/10">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold shrink-0">
                              {m.lecturer?.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{m.lecturer?.name}</p>
                              <p className="text-[10px] text-[var(--text-mutted)]">{roleLabel[m.role] || m.role}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bien ban hoi dong */}
                {(kltn as any).bienbans?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-2">Biên bản Hội đồng & Góp ý</p>
                    <div className="space-y-2">
                      {(kltn as any).bienbans.map((bb: any) => (
                        <div key={bb.id} className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                          {bb.councilFeedback && <p className="text-xs italic mb-2 text-[var(--text-color)]">"{bb.councilFeedback}"</p>}
                          {bb.fileUrl && (
                            <a href={`${SERVER_URL}${bb.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary bg-white dark:bg-slate-800 text-emerald-600 border-none shadow-sm text-[10px] py-1 px-2 font-bold inline-flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" /></svg>
                              Tải Biên bản
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-amber-400">Hội đồng bảo vệ chưa được phân công. Bộ môn sẽ thông báo lịch bảo vệ sớm.</p>
              </div>
            )}

            {/* Score Details for KLTN */}
            <RenderScoreDetails reg={kltn} />

            {/* Submission UI for KLTN */}
            {['APPROVED', 'SUBMITTING', 'SUBMITTED', 'REJECTED'].includes((kltn as any).status) && (
              (kltn as any).submissions?.filter((s: any) => s.version === 1)?.length > 0 && (kltn as any).status !== 'REJECTED' ? (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                  <h5 className="text-sm font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Đã Nộp Khóa Luận Tốt Nghiệp
                  </h5>
                  <a href={`${SERVER_URL}${(kltn as any).submissions.find((s: any) => s.version === 1).fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs inline-flex border-emerald-500/30 text-emerald-600">📄 Xem File Khóa Luận</a>
                </div>
              ) : (
                <div className="mt-6 p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] space-y-4">
                  <h5 className="text-sm font-bold uppercase tracking-widest text-emerald-500">Cổng nộp bài KLTN</h5>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-mutted)]">Tệp báo cáo KLTN (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange((kltn as any).id, 'report', e.target.files?.[0])} className="input-field py-1.5" />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSubmitKLTN((kltn as any).id)}
                      disabled={submitting === (kltn as any).id}
                      className="btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                    >
                      Nộp Khóa luận
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Post-Defense Revision Section */}
            {((kltn as any).status === 'REVISING' || (kltn as any).councilEntry?.defenseEnd === true) && (
              <div className="mt-6 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                <h5 className="text-sm font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Chỉnh sửa sau Bảo vệ
                </h5>

                {/* Tracking status duyệt bản chỉnh sửa */}
                {(() => {
                  const rev = (kltn as any).submissions?.find((s: any) => s.version === 2);
                  if (!rev) {
                    return (
                      <div className="space-y-4 border-t border-amber-500/20 pt-4 mt-2">
                        <p className="text-xs text-amber-600">Nộp bài chỉnh sửa theo góp ý của Hội đồng và Biên bản giải trình.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[var(--text-mutted)]">Bài KLTN chỉnh sửa (PDF)</label>
                            <input type="file" accept=".pdf" onChange={(e) => handleFileChange((kltn as any).id, 'revision', e.target.files?.[0])} className="input-field py-1" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[var(--text-mutted)]">Biên bản giải trình (PDF)</label>
                            <input type="file" accept=".pdf" onChange={(e) => handleFileChange((kltn as any).id, 'explanation', e.target.files?.[0])} className="input-field py-1" />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSubmitRevision((kltn as any).id)}
                            disabled={submitting === (kltn as any).id}
                            className="btn-primary bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                          >
                            Nộp bài chỉnh sửa
                          </button>
                        </div>
                        <p className="text-xs text-amber-600 italic">* GVHD và CTHĐ sẽ duyệt lại bài sau khi nộp</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4 border-t border-amber-500/20 pt-4 mt-2">
                      <div className="flex gap-4 mb-2">
                        {rev.revisionUrl && <a href={`${SERVER_URL}${rev.revisionUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs border-amber-500/30 text-amber-600 px-3 py-1.5">📝 Bài chỉnh sửa (PDF)</a>}
                        {rev.giaiTrinhUrl && <a href={`${SERVER_URL}${rev.giaiTrinhUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs border-amber-500/30 text-amber-600 px-3 py-1.5">💬 Giải trình (PDF)</a>}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-[var(--glass-border)]">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-[var(--text-mutted)] uppercase mb-1">GV Hướng Dẫn Duyệt</p>
                          {rev.gvhdApproval === 'APPROVED' ? <span className="text-sm font-bold text-emerald-500">✅ Đã phê duyệt</span> : rev.gvhdApproval === 'REJECTED' ? <span className="text-sm font-bold text-red-500">❌ Yêu cầu sửa lại</span> : <span className="text-sm font-bold text-amber-500">⏳ Đang chờ duyệt</span>}
                        </div>
                        <div className="flex-1 border-t md:border-t-0 md:border-l border-[var(--glass-border)] md:pl-4">
                          <p className="text-[10px] font-bold text-[var(--text-mutted)] uppercase mb-1">Chủ Tịch HĐ Duyệt</p>
                          {rev.cthdApproval === 'APPROVED' ? <span className="text-sm font-bold text-emerald-500">✅ Đã phê duyệt</span> : rev.cthdApproval === 'REJECTED' ? <span className="text-sm font-bold text-red-500">❌ Yêu cầu sửa lại</span> : <span className="text-sm font-bold text-[var(--text-mutted)]">Chưa xét duyệt</span>}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-[var(--text-mutted)] italic">Bạn chưa đăng ký KLTN hoặc đăng ký chưa được duyệt.</div>
        )}
      </section>
    </div>
  );
}
