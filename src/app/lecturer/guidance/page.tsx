'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function LecturerGuidance() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'GUIDING'>('PENDING');
  const [selectedRegs, setSelectedRegs] = useState<number[]>([]);
  
  const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').split('/api')[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return <span className="badge badge-warning">Chờ duyệt</span>;
      case 'APPROVED': return <span className="badge badge-primary">Đã duyệt</span>;
      case 'REJECTED': return <span className="badge badge-danger">Từ chối</span>;
      case 'SUBMITTED': return <span className="badge badge-success">Đã nộp bài</span>;
      case 'PASSED': return <span className="badge badge-success">Đạt</span>;
      case 'FAILED': return <span className="badge badge-danger">Không đạt</span>;
      case 'REVISING': return <span className="badge badge-warning">Đang chỉnh sửa</span>;
      case 'DONE': return <span className="badge badge-success">Hoàn thành</span>;
      default: return <span className="badge">{status}</span>;
    }
  };
  
  // Topic Edit State
  const [editingTopic, setEditingTopic] = useState<{id: number, name: string} | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/lecturer/guidance/students');
      setRegistrations(res.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách hướng dẫn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchApprove = async (status: 'APPROVED' | 'REJECTED') => {
    if (selectedRegs.length === 0) return;
    try {
      await api.patch('/lecturer/guidance/approve', {
        registrationIds: selectedRegs,
        status
      });
      toast.success('Đã cập nhật trạng thái các yêu cầu');
      setSelectedRegs([]);
      fetchRegistrations();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;
    try {
      await api.patch('/lecturer/guidance/update-topic', {
        registrationId: editingTopic.id,
        topicName: editingTopic.name
      });
      toast.success('Đã cập nhật tên đề tài');
      setEditingTopic(null);
      fetchRegistrations();
    } catch (error) {
      toast.error('Lỗi khi cập nhật tên đề tài');
    }
  };

  const handleTurnitinUpload = async (regId: number, file: File) => {
    const formData = new FormData();
    formData.append('registrationId', regId.toString());
    formData.append('turnitinFile', file);
    try {
      await api.post('/lecturer/guidance/turnitin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Đã upload Turnitin');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi upload Turnitin');
      console.error("Turnitin Upload Error:", error.response?.data || error);
    }
  };

  const pendingList = registrations.filter(r => r.status === 'PENDING_APPROVAL');
  const guidingList = registrations.filter(r => r.status !== 'PENDING_APPROVAL' && r.status !== 'REJECTED');

  if (isLoading) return <div className="p-8 text-center text-[var(--accent-color)] animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center glass-panel p-8 shadow-lg border border-[var(--glass-border)]">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-color)]">Hướng dẫn Sinh viên</h2>
          <p className="text-[var(--text-mutted)] mt-1">Duyệt đề tài và theo dõi quá trình thực hiện</p>
        </div>
        <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl">
           <button onClick={() => setActiveTab('PENDING')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'PENDING' ? 'bg-white dark:bg-[var(--glass-card)] text-[var(--accent-color)] shadow-md' : 'text-[var(--text-mutted)] hover:text-[var(--text-color)]'}`}>Chờ Duyệt ({pendingList.length})</button>
           <button onClick={() => setActiveTab('GUIDING')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'GUIDING' ? 'bg-white dark:bg-[var(--glass-card)] text-[var(--accent-color)] shadow-md' : 'text-[var(--text-mutted)] hover:text-[var(--text-color)]'}`}>Đang Hướng dẫn ({guidingList.length})</button>
        </div>
      </div>

      {activeTab === 'PENDING' && (
        <div className="glass-panel overflow-hidden border border-[var(--glass-border)]">
          <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
             <div className="flex items-center gap-2">
               <input type="checkbox" checked={selectedRegs.length === pendingList.length && pendingList.length > 0} onChange={(e) => setSelectedRegs(e.target.checked ? pendingList.map(r => r.id) : [])} className="w-4 h-4" />
               <span className="text-sm font-medium">Chọn tất cả</span>
             </div>
             <div className="space-x-2">
               <button onClick={() => handleBatchApprove('REJECTED')} disabled={selectedRegs.length === 0} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-semibold disabled:opacity-50">Từ chối ({selectedRegs.length})</button>
               <button onClick={() => handleBatchApprove('APPROVED')} disabled={selectedRegs.length === 0} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-emerald-500/20 shadow-lg disabled:opacity-50">Duyệt ({selectedRegs.length})</button>
             </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-mutted)]">
                <th className="p-4"></th>
                <th className="p-4">Sinh viên</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Loại đề tài</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Tên đề tài</th>
                <th className="p-4">Hệ ĐT</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map(reg => (
                <tr key={reg.id} className="border-t border-[var(--glass-border)] hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="p-4"><input type="checkbox" checked={selectedRegs.includes(reg.id)} onChange={(e) => setSelectedRegs(e.target.checked ? [...selectedRegs, reg.id] : selectedRegs.filter(id => id !== reg.id))} /></td>
                  <td className="p-4 font-medium">{reg.student.name}</td>
                  <td className="p-4 text-[var(--text-mutted)]">{reg.student.mssv}</td>
                  <td className="p-4"><span className="badge badge-primary">{reg.type}</span></td>
                  <td className="p-4">{getStatusBadge(reg.status)}</td>
                  <td className="p-4 italic text-[13px]">{reg.topicName}</td>
                  <td className="p-4">{reg.student.heDaoTao}</td>
                </tr>
              ))}
              {pendingList.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-[var(--text-mutted)]">Không có yêu cầu chờ duyệt</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'GUIDING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {guidingList.map(reg => (
             <div key={reg.id} className="glass-panel p-6 border-l-4 border-emerald-500 hover:scale-[1.01] transition-transform">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-xl font-bold flex items-center gap-2">
                       {editingTopic?.id === reg.id ? (
                         <div className="flex gap-2">
                           <input 
                             value={editingTopic?.name || ''} 
                             onChange={(e) => editingTopic && setEditingTopic({ id: editingTopic.id, name: e.target.value })} 
                             className="input-field text-sm" 
                           />
                           <button onClick={handleUpdateTopic} className="text-emerald-500">Lưu</button>
                           <button onClick={() => setEditingTopic(null)} className="text-red-500">Hủy</button>
                         </div>
                       ) : (
                         <>
                           {reg.topicName}
                           <button onClick={() => setEditingTopic({id: reg.id, name: reg.topicName})} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2}/></svg>
                           </button>
                         </>
                       )}
                     </h3>
                     <p className="text-sm text-[var(--text-mutted)]">SV: {reg.student.name} - {reg.student.mssv} ({reg.student.heDaoTao})</p>
                   </div>
                   <div className="flex flex-col gap-2 items-end">
                     <span className={`badge ${reg.type === 'KLTN' ? 'badge-primary bg-indigo-500/10 text-indigo-500' : 'badge-warning bg-amber-500/10 text-amber-500'} uppercase font-bold`}>{reg.type}</span>
                     {getStatusBadge(reg.status)}
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-1">
                       <p className="text-xs uppercase font-bold text-[var(--text-mutted)]">Kiểm tra Turnitin</p>
                       {reg.type === 'KLTN' ? (() => {
                          const sub1 = reg.submissions?.find((s:any) => s.version === 1);
                          if (!sub1) return <p className="text-[11px] text-amber-500 italic mt-1">Chưa nộp KLTN</p>;
                           if (sub1.turnitinUrl) return (
                             <a 
                               href={`${SERVER_URL}${sub1.turnitinUrl}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               onClick={(e) => e.stopPropagation()} 
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--badge-primary-bg)] text-[var(--badge-primary-text)] rounded-lg text-[11px] font-bold hover:opacity-80 transition-colors"
                             >
                               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                               Xem kết quả
                             </a>
                          );
                          return (
                             <label className="text-xs text-indigo-500 cursor-pointer font-bold hover:underline">
                                Upload File K.Tra
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => {
                                  if (e.target.files?.[0]) handleTurnitinUpload(reg.id, e.target.files[0]);
                                  e.target.value = '';
                                }} />
                             </label>
                          );
                       })() : (
                          <p className="text-[11px] text-[var(--text-mutted)] italic mt-1">Không bắt buộc cho BCTT</p>
                       )}
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs uppercase font-bold text-[var(--text-mutted)]">Bài nộp SV</p>
                       <div className="flex flex-col gap-1">
                          {reg.submissions?.map((s: any) => (
                             <a 
                               key={s.id} 
                               href={`${SERVER_URL}${s.fileUrl || s.revisionUrl}`} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-[11px] text-[var(--badge-success-text)] font-bold hover:underline flex items-center gap-1"
                             >
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2}/></svg>
                               V.{s.version}: {s.version === 2 ? 'Bản chỉnh sửa' : 'Bản gốc'}
                             </a>
                          ))}
                          {(reg.submissions?.length || 0) === 0 && <p className="text-[11px] italic text-[var(--text-mutted)]">Chưa nộp bài</p>}
                       </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex justify-end">
                   <button 
                      onClick={() => router.push(`/lecturer/grading/${reg.id}`)}
                      className="text-sm font-semibold text-emerald-500 hover:bg-emerald-500/10 px-4 py-2 rounded-lg transition-colors"
                   >
                      Vào trang chấm điểm
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
