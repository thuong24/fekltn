'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Period, LecturerWithQuota } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterKLTN() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [periods, setPeriods] = useState<Period[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [lecturers, setLecturers] = useState<LecturerWithQuota[]>([]);
  const [defaultLecturer, setDefaultLecturer] = useState<{ name: string; email: string } | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [topicName, setTopicName] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canRegister, setCanRegister] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [statusRes, periodRes, fieldRes] = await Promise.all([
          api.get('/student/me/status'),
          api.get(`/student/periods?type=KLTN&active=true&major=${user?.major || ''}&heDaoTao=${user?.heDaoTao || ''}`),
          api.get(`/student/fields?major=${user?.major || ''}`)
        ]);

        // Check if student can register KLTN
        const stage = statusRes.data.data?.currentStage;
        if (stage === 'BCTT_PASSED' || stage === 'KLTN') {
          setCanRegister(true);
          // Autofill GVHD from BCTT
          const bcttGV = statusRes.data.data?.bcttRegistration?.lecturer;
          if (bcttGV) {
            setDefaultLecturer(bcttGV);
            setSelectedLecturer(bcttGV.email);
          }
        } else if (stage === 'NONE') {
          setBlockReason('Bạn cần hoàn thành BCTT trước khi đăng ký KLTN.');
        } else if (stage === 'BCTT') {
          setBlockReason('Đang thực hiện BCTT. Vui lòng hoàn thành và đạt BCTT trước.');
        } else if (stage === 'KLTN') {
          setBlockReason('Bạn đã đăng ký KLTN.');
        }

        if (periodRes.data.success) setPeriods(periodRes.data.data);
        if (fieldRes.data.success) setFields(fieldRes.data.data);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) initData();
  }, [user]);

  // Fetch lecturers when field or period changes
  useEffect(() => {
    if (!selectedField || !selectedPeriod) return;
    const fetchLecturers = async () => {
      try {
        const res = await api.get(`/student/lecturers?major=${user?.major || ''}&field=${selectedField}&periodId=${selectedPeriod}`);
        if (res.data.success) {
          setLecturers(res.data.data);
          // Re-select default lecturer if available
          if (defaultLecturer && !selectedLecturer) {
            setSelectedLecturer(defaultLecturer.email);
          }
        }
      } catch {}
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
      const res = await api.post('/student/registrations/kltn', {
        topicName,
        field: selectedField,
        lecturerEmail: selectedLecturer,
        periodId: parseInt(selectedPeriod)
      });

      if (res.data.success) {
        toast.success('Đăng ký KLTN thành công!');
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

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 mx-auto rounded-full"></div></div>;

  if (!canRegister) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-12 text-center">
          <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-3">Chưa thể đăng ký KLTN</h3>
          <p className="text-[var(--text-mutted)]">{blockReason}</p>
          <button onClick={() => router.push('/student/dashboard')} className="btn-secondary mt-6">
            Quay về Tổng quan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zM12 14V20"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-color)]">Đăng ký Khóa Luận Tốt Nghiệp</h2>
            <p className="text-[var(--text-mutted)] text-sm">Bạn đã đạt BCTT. Hãy điền thông tin đăng ký KLTN bên dưới.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        {defaultLecturer && (
          <div className="relative z-10 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              <span className="font-bold">GVHD mặc định</span>: {defaultLecturer.name} ({defaultLecturer.email}) — từ đợt BCTT của bạn
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-color)]">Đợt đăng ký KLTN</label>
              <select
                title="Chọn đợt đăng ký KLTN"
                className="glass-input appearance-none bg-[var(--input-bg)]"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                required
              >
                <option value="" disabled>-- Chọn đợt KLTN đang mở --</option>
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
            <label className="text-sm font-medium text-[var(--text-color)]">Tên đề tài KLTN</label>
            <input
              type="text"
              placeholder="Nhập tên đề tài khóa luận..."
              className="glass-input"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
            />
          </div>

          {/* Lecturer Selection */}
          {selectedField && (
            <div className="space-y-3 pt-4 border-t border-[var(--glass-border)] mt-6">
              <h3 className="text-lg font-medium text-[var(--accent-color)]">Giảng viên Hướng dẫn</h3>
              <p className="text-xs text-[var(--text-mutted)]">
                {defaultLecturer ? 'GVHD từ đợt BCTT đã được chọn mặc định. Bạn có thể thay đổi nếu cần.' : `Hệ thống gợi ý GV có chuyên môn thuộc lĩnh vực ${selectedField}`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {lecturers.length === 0 ? (
                  <div className="col-span-2 p-4 text-center text-[var(--text-mutted)] glass-card font-medium italic">
                    {selectedPeriod ? 'Không có giảng viên nào phù hợp hoặc còn chỉ tiêu.' : 'Vui lòng chọn đợt đăng ký trước.'}
                  </div>
                ) : (
                  lecturers.map(lecturer => {
                    const isAvailable = lecturer.quota && lecturer.quota.available > 0;
                    const isSelected = selectedLecturer === lecturer.email;
                    const isDefault = defaultLecturer?.email === lecturer.email;
                    return (
                      <div
                        key={lecturer.id}
                        onClick={() => isAvailable && setSelectedLecturer(lecturer.email)}
                        className={`p-5 rounded-3xl border transition-all duration-300 ${!isAvailable ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 cursor-not-allowed' : isSelected ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.1)] cursor-pointer' : 'glass-card border-[var(--glass-border)] hover:border-emerald-400/50 cursor-pointer'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-[var(--text-color)]">{lecturer.name}</p>
                            <p className="text-xs text-[var(--text-mutted)] mt-1">{lecturer.email}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            {isDefault && <span className="badge badge-success text-[10px]">Từ BCTT</span>}
                            {isAvailable ? (
                              <span className="badge badge-primary text-[10px]">Trống {lecturer.quota?.available}/{lecturer.quota?.total}</span>
                            ) : (
                              <span className="badge badge-danger text-[10px]">Đã đầy</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {lecturer.fields.slice(0, 3).map(f => (
                            <span key={f} className={`text-[10px] px-2 py-0.5 rounded border ${f === selectedField ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-600 text-slate-400'}`}>{f}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={() => router.push('/student/dashboard')} className="btn-secondary px-8">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedLecturer}
              className={`btn-primary px-8 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 ${(!selectedLecturer || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                'Gửi Đăng ký KLTN'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
