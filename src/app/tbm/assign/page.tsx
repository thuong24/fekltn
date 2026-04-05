'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

type TabKey = 'reviewer' | 'council' | 'assign';

export default function TBMAssign() {
  const [activeTab, setActiveTab] = useState<TabKey>('reviewer');
  const [kltnRegistrations, setKltnRegistrations] = useState<any[]>([]);
  const [councils, setCouncils] = useState<any[]>([]);
  const [allLecturers, setAllLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Council create form
  const [newCouncilName, setNewCouncilName] = useState('');
  const [newCouncilLocation, setNewCouncilLocation] = useState('');
  const [newCouncilDate, setNewCouncilDate] = useState('');

  // Council member assignment
  const [selectedCouncilId, setSelectedCouncilId] = useState<number | ''>('');
  const [councilMembers, setCouncilMembers] = useState<{ lecturerEmail: string; role: string }[]>([
    { lecturerEmail: '', role: 'CTHD' },
    { lecturerEmail: '', role: 'ThukyHD' },
  ]);

  // Student to council
  const [councilForStudent, setCouncilForStudent] = useState<{ [regId: number]: number }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regRes, councilRes, lvRes] = await Promise.all([
        api.get('/tbm/students?type=KLTN'),
        api.get('/tbm/councils'),
        api.get('/student/lecturers'),
      ]);
      if (regRes.data.success) setKltnRegistrations(regRes.data.data);
      if (councilRes.data.success) setCouncils(councilRes.data.data);
      if (lvRes.data.success) setAllLecturers(lvRes.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // -------- Reviewer Assignment --------
  const handleAssignReviewer = async (regId: number, reviewerEmail: string) => {
    if (!reviewerEmail) return;
    try {
      await api.post('/tbm/assign-reviewer', { assignments: [{ registrationId: regId, reviewerEmail }] });
      toast.success('Phân công GVPB thành công!');
      fetchData();
    } catch { toast.error('Lỗi khi phân công'); }
  };

  // -------- Council Create --------
  const handleCreateCouncil = async () => {
    if (!newCouncilName.trim()) { toast.error('Vui lòng nhập tên hội đồng'); return; }
    try {
      await api.post('/tbm/councils', { name: newCouncilName, diaPoint: newCouncilLocation, defenseDate: newCouncilDate || undefined });
      toast.success('Tạo hội đồng thành công!');
      setNewCouncilName(''); setNewCouncilLocation(''); setNewCouncilDate('');
      fetchData();
    } catch { toast.error('Lỗi khi tạo hội đồng'); }
  };

  // -------- Council Member Assignment --------
  const addMemberRow = () => setCouncilMembers(prev => [...prev, { lecturerEmail: '', role: 'TVHD' }]);
  const removeMemberRow = (idx: number) => setCouncilMembers(prev => prev.filter((_, i) => i !== idx));
  const updateMember = (idx: number, field: 'lecturerEmail' | 'role', value: string) => {
    setCouncilMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleAssignMembers = async () => {
    if (!selectedCouncilId) { toast.error('Vui lòng chọn hội đồng'); return; }
    const valid = councilMembers.filter(m => m.lecturerEmail);
    if (!valid.length) { toast.error('Vui lòng chọn ít nhất 1 thành viên'); return; }
    try {
      await api.post('/tbm/assign-council-members', { councilId: selectedCouncilId, members: valid });
      toast.success('Phân công thành viên hội đồng thành công!');
      fetchData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi khi phân công'); }
  };

  // -------- Student to Council Assignment --------
  const handleAssignStudentToCouncil = async (regId: number) => {
    const councilId = councilForStudent[regId];
    if (!councilId) { toast.error('Vui lòng chọn hội đồng'); return; }
    try {
      await api.post('/tbm/assign-student-to-council', { councilId, registrationIds: [regId] });
      toast.success('Gán sinh viên vào hội đồng thành công!');
      fetchData();
    } catch { toast.error('Lỗi khi gán sinh viên'); }
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'council', label: '1. Tạo & Phân công Hội đồng', icon: '🏛️' },
    { key: 'assign', label: '2. Gán SV vào Hội đồng', icon: '📋' },
  ];

  if (loading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 mx-auto rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-[var(--text-color)]">Phân công Hội đồng Bảo vệ</h2>
        <p className="text-[var(--text-mutted)] mt-1">Quản lý phân công GVPB, thành lập và gán sinh viên vào hội đồng bảo vệ KLTN</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'SV KLTN', value: kltnRegistrations.length, color: 'indigo' },
          { label: 'Chưa phân công GVPB', value: kltnRegistrations.filter(r => !r.councilEntry?.reviewerId).length, color: 'amber' },
          { label: 'Hội đồng đã tạo', value: councils.length, color: 'emerald' },
        ].map(stat => (
          <div key={stat.label} className={`glass-panel p-4 border-l-4 border-${stat.color}-500`}>
            <p className="text-2xl font-black text-[var(--text-color)]">{stat.value}</p>
            <p className="text-xs text-[var(--text-mutted)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--glass-border)] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-[var(--text-mutted)] hover:text-[var(--text-color)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===== TAB 1: COUNCIL MANAGEMENT ===== */}
      {activeTab === 'council' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Council */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Hội đồng mới
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Tên hội đồng *</label>
                <input type="text" className="input-field mt-1" placeholder="VD: Hội đồng KLTN 1 - QLCN" value={newCouncilName} onChange={e => setNewCouncilName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Địa điểm</label>
                <input type="text" className="input-field mt-1" placeholder="VD: Phòng B301" value={newCouncilLocation} onChange={e => setNewCouncilLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Ngày bảo vệ</label>
                <input type="datetime-local" className="input-field mt-1" value={newCouncilDate} onChange={e => setNewCouncilDate(e.target.value)} />
              </div>
              <button onClick={handleCreateCouncil} className="btn-primary w-full">Tạo Hội đồng</button>
            </div>
          </div>

          {/* Assign Members */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Phân công Thành viên Hội đồng
            </h3>
            <div>
              <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Chọn hội đồng</label>
              <select className="input-field mt-1" value={selectedCouncilId} onChange={e => setSelectedCouncilId(parseInt(e.target.value) || '')}>
                <option value="">-- Chọn hội đồng --</option>
                {councils.map(c => <option key={c.id} value={c.id}>{c.name}{c.diaPoint ? ` — ${c.diaPoint}` : ''}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {councilMembers.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select className="input-field py-1.5 flex-1" value={m.role} onChange={e => updateMember(idx, 'role', e.target.value)}>
                    <option value="CTHD">Chủ tịch (CTHD)</option>
                    <option value="ThukyHD">Thư ký (ThukyHD)</option>
                    <option value="TVHD">Thành viên (TVHD)</option>
                    <option value="GVPB">Phản biện (GVPB)</option>
                  </select>
                  <select className="input-field py-1.5 flex-1" value={m.lecturerEmail} onChange={e => updateMember(idx, 'lecturerEmail', e.target.value)}>
                    <option value="">-- Chọn GV --</option>
                    {allLecturers.map(l => <option key={l.id} value={l.email}>{l.name}</option>)}
                  </select>
                  {councilMembers.length > 1 && (
                    <button onClick={() => removeMemberRow(idx)} className="text-red-400 hover:text-red-300 transition-colors p-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addMemberRow} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Thêm thành viên
              </button>
            </div>

            <button onClick={handleAssignMembers} className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
              Lưu Phân công
            </button>
          </div>

          {/* Council List */}
          <div className="lg:col-span-2 glass-panel overflow-hidden">
            <div className="p-6 border-b border-[var(--glass-border)]">
              <h3 className="font-bold">Danh sách Hội đồng đã tạo ({councils.length})</h3>
            </div>
            {councils.length === 0 ? (
              <p className="text-center py-8 text-[var(--text-mutted)] italic">Chưa có hội đồng nào</p>
            ) : (
              <div className="divide-y divide-[var(--glass-border)]">
                {councils.map(c => (
                  <div key={c.id} className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 font-bold text-sm">
                      {c.id}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[var(--text-color)]">{c.name}</p>
                      <div className="flex gap-4 text-xs text-[var(--text-mutted)] mt-1">
                        {c.diaPoint && <span>📍 {c.diaPoint}</span>}
                        {c.defenseDate && <span>📅 {new Date(c.defenseDate).toLocaleString('vi-VN')}</span>}
                        <span>👥 {c.members?.length || 0} thành viên</span>
                        <span>🎓 {c.students?.length || 0} sinh viên</span>
                      </div>
                      {c.members?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.members.map((m: any) => (
                            <span key={m.id} className="text-[10px] px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                              {m.role}: {m.lecturer?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 3: ASSIGN STUDENTS TO COUNCIL ===== */}
      {activeTab === 'assign' && (
        <div className="glass-panel overflow-hidden">
          <div className="p-6 border-b border-[var(--glass-border)]">
            <h3 className="font-bold text-lg">Gán Sinh viên vào Hội đồng Bảo vệ</h3>
            <p className="text-sm text-[var(--text-mutted)] mt-1">Xếp lịch bảo vệ cho từng sinh viên KLTN</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">Sinh viên</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">Đề tài</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">GVHD</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">GVPB</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">Hội đồng đang thuộc</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-mutted)]">Gán HĐ</th>
                </tr>
              </thead>
              <tbody>
                {kltnRegistrations.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-[var(--text-mutted)] italic">Chưa có sinh viên KLTN</td></tr>
                )}
                {kltnRegistrations.map(reg => {
                  const reviewer = allLecturers.find(l => l.id === reg.councilEntry?.reviewerId);
                  return (
                    <tr key={reg.id} className="border-t border-[var(--glass-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">{reg.student?.name}</p>
                        <p className="text-xs text-[var(--text-mutted)]">{reg.student?.mssv}</p>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-[200px]">
                        <p className="truncate" title={reg.topicName}>{reg.topicName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-500 font-medium">{reg.lecturer?.name}</td>
                      <td className="px-6 py-4">
                        {reviewer ? (
                          <span className="text-sm text-emerald-500">{reviewer.name}</span>
                        ) : (
                          <span className="badge badge-warning text-xs">Chưa phân công</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {reg.councilEntry?.council ? (
                          <div>
                            <p className="text-sm font-medium text-emerald-500">{reg.councilEntry.council.name}</p>
                            {reg.councilEntry.council.diaPoint && (
                              <p className="text-xs text-[var(--text-mutted)]">📍 {reg.councilEntry.council.diaPoint}</p>
                            )}
                          </div>
                        ) : (
                          <span className="badge badge-warning text-xs">Chưa xếp</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className="input-field py-1.5 text-sm min-w-[160px]"
                            value={councilForStudent[reg.id] || reg.councilEntry?.councilId || ''}
                            onChange={e => setCouncilForStudent(prev => ({ ...prev, [reg.id]: parseInt(e.target.value) }))}
                          >
                            <option value="">-- Chọn HĐ --</option>
                            {councils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssignStudentToCouncil(reg.id)}
                            className="btn-primary text-xs px-3 py-2 shrink-0"
                          >
                            Gán
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
