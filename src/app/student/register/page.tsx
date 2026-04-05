'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Period, LecturerWithQuota } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterBCTT() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [periods, setPeriods] = useState<Period[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [lecturers, setLecturers] = useState<LecturerWithQuota[]>([]);
  const [studentStage, setStudentStage] = useState<string>('');
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [topicName, setTopicName] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const [statusRes, periodRes, fieldRes] = await Promise.all([
          api.get('/student/me/status'),
          api.get(`/student/periods?type=BCTT&active=true&major=${user?.major || ''}&heDaoTao=${user?.heDaoTao || ''}`),
          api.get(`/student/fields?major=${user?.major || ''}`)
        ]);
        
        if (statusRes.data.success) setStudentStage(statusRes.data.data?.currentStage || '');
        if (periodRes.data.success) setPeriods(periodRes.data.data);
        if (fieldRes.data.success) setFields(fieldRes.data.data);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu khởi tạo');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) initData();
  }, [user]);

  // Fetch lecturers when field changes
  useEffect(() => {
    if (!selectedField || !selectedPeriod) return;
    
    const fetchLecturers = async () => {
      try {
        const res = await api.get(`/student/lecturers?major=${user?.major || ''}&field=${selectedField}&periodId=${selectedPeriod}`);
        if (res.data.success) {
          setLecturers(res.data.data);
          setSelectedLecturer(''); // Reset selection
        }
      } catch (error) {
        toast.error('Lỗi khi tải danh sách giảng viên');
      }
    };
    fetchLecturers();
  }, [selectedField, selectedPeriod, user?.major]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriod || !selectedField || !selectedLecturer || !topicName) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/student/registrations/bctt', {
        topicName,
        field: selectedField,
        lecturerEmail: selectedLecturer,
        periodId: parseInt(selectedPeriod)
      });

      if (res.data.success) {
        toast.success('Đăng ký BCTT thành công!');
        router.push('/student/progress');
      } else {
        toast.error(res.data.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 mx-auto rounded-full"></div></div>;

  // If student already passed BCTT or in KLTN, show redirect banner
  if (studentStage === 'BCTT_PASSED' || studentStage === 'KLTN' || studentStage === 'COMPLETED') {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {(studentStage === 'BCTT_PASSED') && (
          <div className="glass-panel p-6 border-l-4 border-emerald-500 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-color)]">Bạn đã hoàn thành BCTT!</h3>
                <p className="text-sm text-[var(--text-mutted)]">Hãy tiến hành đăng ký Khóa Luận Tốt Nghiệp để tiếp tục.</p>
              </div>
            </div>
            <a href="/student/register/kltn" className="btn-primary shrink-0 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
              Đăng ký KLTN →
            </a>
          </div>
        )}
        {(studentStage === 'KLTN' || studentStage === 'COMPLETED') && (
          <div className="glass-panel p-6 border-l-4 border-blue-500 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[var(--text-color)]">Bạn đã đăng ký KLTN</h3>
              <p className="text-sm text-[var(--text-mutted)]">Vui lòng theo dõi tiến độ tại trang Theo dõi Trạng thái.</p>
            </div>
            <a href="/student/progress" className="btn-secondary shrink-0">Xem Tiến độ →</a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">Đăng ký Báo Cáo Thực Tập</h2>
        <p className="text-[var(--text-mutted)]">Hoàn thiện thông tin bên dưới để gửi yêu cầu hướng dẫn BCTT đến Giảng viên.</p>
      </div>

      <div className="glass-panel p-8 relative overflow-hidden">
        {/* Decorator globs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-color)]">Đợt đăng ký</label>
              <select 
                title="Chọn đợt đăng ký"
                className="glass-input appearance-none bg-[var(--input-bg)]"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                required
              >
                <option value="" disabled>-- Chọn đợt BCTT đang mở --</option>
                {periods.map(p => (
                  <option key={p.id} value={p.id}>Đợt {p.dot} ({new Date(p.startReg).toLocaleDateString('vi-VN')} - {new Date(p.endReg).toLocaleDateString('vi-VN')})</option>
                ))}
              </select>
            </div>

            {/* Field Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-color)]">Lĩnh vực chuyên môn</label>
              <select 
                title="Chọn lĩnh vực"
                className="glass-input appearance-none bg-[var(--input-bg)] disabled:opacity-50"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                required
                disabled={!selectedPeriod}
              >
                <option value="" disabled>-- Cần chọn đợt đăng ký trước --</option>
                {fields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-color)]">Tên đề tài BCTT</label>
            <input 
              type="text"
              placeholder="Nhập tên đề tài mong muốn thực hiện..."
              className="glass-input"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
            />
          </div>

          {/* Lecturer Selection */}
          {selectedField && (
            <div className="space-y-3 pt-4 border-t border-[var(--glass-border)] mt-6">
              <h3 className="text-lg font-medium text-[var(--accent-color)]">Chọn Giảng viên Hướng dẫn</h3>
              <p className="text-xs text-[var(--text-mutted)]">Hệ thống đã tự động gợi ý giảng viên có chuyên môn thuộc lĩnh vực {selectedField}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {lecturers.length === 0 ? (
                  <div className="col-span-2 p-4 text-center text-slate-400 glass-card">
                    Không có giảng viên nào phù hợp hoặc còn slot nộp cho chuyên ngành này.
                  </div>
                ) : (
                  lecturers.map(lecturer => {
                    const isAvailable = lecturer.quota && lecturer.quota.available > 0;
                    const isSelected = selectedLecturer === lecturer.email;
                    
                    return (
                      <div 
                        key={lecturer.id}
                        onClick={() => isAvailable && setSelectedLecturer(lecturer.email)}
                        className={`p-4 rounded-xl border transition-all duration-300 ${!isAvailable ? 'bg-slate-800/30 border-white/5 opacity-60 cursor-not-allowed' : isSelected ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer' : 'glass-card border-white/10 hover:border-indigo-400/50 cursor-pointer'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-[var(--text-color)]">{lecturer.name}</p>
                            <p className="text-xs text-[var(--text-mutted)] mt-1">{lecturer.email}</p>
                          </div>
                          {isAvailable ? (
                             <span className="badge badge-success text-[10px]">Trống {lecturer.quota?.available}/{lecturer.quota?.total}</span>
                          ) : (
                             <span className="badge badge-danger text-[10px]">Đã đầy</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {lecturer.fields.slice(0, 3).map(f => (
                            <span key={f} className={`text-[10px] px-2 py-0.5 rounded border ${f === selectedField ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-600 text-slate-400'}`}>
                              {f}
                            </span>
                          ))}
                          {lecturer.fields.length > 3 && <span className="text-[10px] px-2 py-0.5 text-slate-500">+{lecturer.fields.length - 3}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedLecturer}
              className={`btn-primary px-8 ${(!selectedLecturer || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2">
                   <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Đang xử lý...
                 </span>
              ) : (
                'Gửi Đăng Ký'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
