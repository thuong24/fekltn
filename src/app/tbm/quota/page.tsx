'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function TBMQuota() {
  const [quotas, setQuotas] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Form state
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [heDaoTao, setHeDaoTao] = useState('DaiTra');
  const [totalQuota, setTotalQuota] = useState(5);
  const [quotaMajor, setQuotaMajor] = useState('');

  const [newPeriod, setNewPeriod] = useState({ dot: '', startReg: '', endReg: '', loaiDetai: 'BCTT', major: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [qRes, lRes, pRes] = await Promise.all([
        api.get('/tbm/quota'),
        api.get('/student/lecturers'),
        api.get('/student/periods')
      ]);
      setQuotas(qRes.data.data);
      setLecturers(lRes.data.data);
      setPeriods(pRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotaMajor) {
      toast.error('Vui lòng chọn chuyên ngành');
      return;
    }
    try {
      await api.post('/tbm/quota', {
        lecturerId: selectedLecturer,
        periodId: selectedPeriod,
        major: quotaMajor,
        heDaoTao,
        totalQuota
      });
      fetchData();
      toast.success('Đã cập nhật quota!');
    } catch (error) {
      toast.error('Lỗi khi cập nhật quota');
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriod.major) {
      toast.error('Vui lòng chọn chuyên ngành cho đợt mới');
      return;
    }
    try {
      await api.post('/tbm/periods', { ...newPeriod });
      fetchData();
      toast.success('Đã tạo đợt mới thành công!');
      setNewPeriod({ dot: '', startReg: '', endReg: '', loaiDetai: 'BCTT', major: '' });
    } catch (error) {
      toast.error('Lỗi tạo đợt');
    }
  };

  const toggleApproval = async (id: number, approved: boolean) => {
    try {
      await api.patch('/tbm/approve-quota', { quotaIds: [id], approved });
      fetchData();
      toast.success(approved ? 'Đã duyệt quota' : 'Đã hủy duyệt quota');
    } catch (error) {
      toast.error('Lỗi khi duyệt quota');
    }
  };

  if (loading) return <div className="p-8 text-center text-indigo-500 animate-pulse font-bold">Đang tải dữ liệu Quota...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-color)] tracking-tight">Quản lý Quota & Đợt đăng ký</h2>
          <p className="text-[var(--text-mutted)] mt-1">Thiết lập chỉ tiêu hướng dẫn cho giảng viên và quản lý các đợt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Create Period Form */}
        <div className="glass-panel p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
          <h3 className="text-xl font-bold mb-6 text-emerald-500 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth={2} /></svg>
            Tạo Đợt Mới
          </h3>
          <form onSubmit={handleCreatePeriod} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Tên đợt</label>
                <input required placeholder="VD: Đợt 1 HK1 24-25" value={newPeriod.dot} onChange={e => setNewPeriod({ ...newPeriod, dot: e.target.value })} className="input-field w-full text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Loại đề tài</label>
                <select value={newPeriod.loaiDetai} onChange={e => setNewPeriod({ ...newPeriod, loaiDetai: e.target.value })} className="input-field w-full text-sm">
                  <option value="BCTT">Báo cáo Thực tập (BCTT)</option>
                  <option value="KLTN">Khóa luận Tốt nghiệp (KLTN)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Chuyên ngành (Bắt buộc)</label>
              <select value={newPeriod.major} onChange={e => setNewPeriod({ ...newPeriod, major: e.target.value })} className="input-field w-full text-sm" required>
                <option value="">-- Chọn chuyên ngành --</option>
                <option value="QLCN">Quản lý Công nghiệp (QLCN)</option>
                <option value="ECom">Thương mại Điện tử (ECom)</option>
                <option value="Log">Logistics (Log)</option>
                <option value="KHQT">Kinh doanh Quốc tế (IntBus)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Bắt đầu đăng ký</label>
                <input required type="date" value={newPeriod.startReg} onChange={e => setNewPeriod({ ...newPeriod, startReg: e.target.value })} className="input-field w-full text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Kết thúc đăng ký</label>
                <input required type="date" value={newPeriod.endReg} onChange={e => setNewPeriod({ ...newPeriod, endReg: e.target.value })} className="input-field w-full text-sm" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3 bg-emerald-600 border-none shadow-emerald-500/20 shadow-xl font-bold">Xác nhận tạo Đợt mới</button>
          </form>
        </div>

        {/* Quota Form Section */}
        <div className="glass-panel p-8 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
          <h3 className="text-xl font-bold mb-6 text-indigo-500 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth={2} /></svg>
            Cấp Quota Giảng Viên
          </h3>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Giảng viên</label>
                <select value={selectedLecturer} onChange={(e) => setSelectedLecturer(e.target.value)} className="w-full input-field text-sm" required>
                  <option value="">Chọn giảng viên</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Đợt</label>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full input-field text-sm" required>
                  <option value="">Chọn đợt</option>
                  {periods.map(p => <option key={p.id} value={p.id}>[{p.major}] {p.dot} - {p.loaiDetai}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Hệ đào tạo</label>
                <select value={heDaoTao} onChange={(e) => setHeDaoTao(e.target.value)} className="w-full input-field text-sm">
                  <option value="DaiTra">Đại trà</option>
                  <option value="CLC">Chất lượng cao</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Chuyên ngành</label>
                <select value={quotaMajor} onChange={e => setQuotaMajor(e.target.value)} className="w-full input-field text-sm" required>
                  <option value="">-- Chọn chuyên ngành --</option>
                  <option value="QLCN">Quản lý Công nghiệp (QLCN)</option>
                  <option value="ECom">Thương mại Điện tử (ECom)</option>
                  <option value="Log">Logistics (Log)</option>
                  <option value="KHQT">Kinh doanh Quốc tế (IntBus)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-mutted)] uppercase">Chỉ tiêu (số SV quy đổi)</label>
              <input type="number" value={totalQuota} onChange={(e) => setTotalQuota(parseInt(e.target.value))} className="w-full input-field text-sm font-bold text-indigo-500" />
            </div>

            <button type="submit" className="btn-primary w-full py-3 shadow-indigo-600/20 shadow-xl font-bold">Lưu cấu hình Quota</button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="glass-panel overflow-hidden border border-[var(--glass-border)] shadow-2xl">
        <div className="p-6 bg-black/5 dark:bg-white/5 border-b border-[var(--glass-border)] flex justify-between items-center">
          <h4 className="font-bold text-[var(--text-color)] uppercase tracking-widest text-xs">Danh sách Quota đã cấp</h4>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold border border-emerald-500/20">Xanh: Đã duyệt</span>
            <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-[10px] font-bold border border-red-500/20">Đỏ: Chưa duyệt</span>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black/2 dark:bg-white/2 text-left text-xs uppercase tracking-wider text-[var(--text-mutted)]">
              <th className="px-8 py-5">Giảng viên</th>
              <th className="px-6 py-5">Hệ đào tạo</th>
              <th className="px-6 py-5">Chuyên ngành</th>
              <th className="px-6 py-5">Đợt thực hiện</th>
              <th className="px-6 py-5 text-center">C.Tiêu (Đã dùng/Tối đa)</th>
              <th className="px-8 py-5 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {quotas.map((q) => (
              <tr key={q.id} className="border-b border-[var(--glass-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-all group">
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-[var(--text-color)]">{q.lecturer.name}</p>
                  <p className="text-[10px] text-[var(--text-mutted)] font-mono">{q.lecturer.email}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-[var(--text-color)]">{q.heDaoTao === 'DaiTra' ? 'Đại trà' : 'CLC'}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-black text-indigo-500">{q.major}</span>
                </td>
                <td className="px-6 py-5 min-w-[250px]">
                  <p className="text-xs font-bold">[{q.period.major}] {q.period.dot}</p>
                  <p className="text-[10px] text-[var(--text-mutted)] italic mt-1">{q.period.loaiDetai}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-sm" style={{ width: `${Math.min(100, (q.usedQuota / q.totalQuota) * 100)}%` }}></div>
                    </div>
                    <span className="text-xs font-black text-indigo-600">{q.usedQuota} / {q.totalQuota}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <button onClick={() => toggleApproval(q.id, !q.approved)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-md ${q.approved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20 hover:scale-105 active:scale-95'}`}>
                    {q.approved ? 'Đã duyệt' : 'Duyệt ngay'}
                  </button>
                </td>
              </tr>
            ))}
            {quotas.length === 0 && <tr><td colSpan={6} className="px-8 py-20 text-center text-[var(--text-mutted)] italic">Chưa có dữ liệu Quota. Hãy bắt đầu bằng cách cấp Quota cho giảng viên.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
