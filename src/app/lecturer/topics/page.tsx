'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function LecturerTopics() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', field: '', major: '', description: '', dot: ''
  });

  const fetchTopics = async () => {
    try {
      const res = await api.get('/lecturer/topics');
      setTopics(res.data.data || []);
    } catch (e: any) {
      toast.error('Không thể tải danh sách đề tài gợi ý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.field || !formData.major) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc (Tên, Lĩnh vực, Ngành)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/lecturer/topics', formData);
      toast.success('Thêm đề tài gợi ý thành công!');
      setFormData({ title: '', field: '', major: '', description: '', dot: '' });
      setShowForm(false);
      fetchTopics();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi thêm đề tài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề tài gợi ý này không?')) return;
    try {
      await api.delete(`/lecturer/topics/${id}`);
      toast.success('Đã xóa đề tài');
      fetchTopics();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi khi xóa đề tài');
    }
  };

  if (loading) return <div className="p-8 text-center text-indigo-500 animate-pulse font-bold">Đang tải danh sách đề tài...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-[var(--glass-border)] pb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--text-color)]">Gợi ý Đề tài</h2>
          <p className="text-[var(--text-mutted)] mt-1">Quản lý kho đề tài gợi ý cho sinh viên đăng ký tham khảo.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary animate-bounce-subtle">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Thêm Ngay
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel p-8 border-l-4 border-indigo-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-600 px-4 py-1 pb-2 rounded-bl-2xl font-bold text-xs tracking-widest uppercase">
            Tạo Mới ✨
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="text-xs font-bold text-[var(--text-mutted)] uppercase mb-1 block">Tên Đề tài (Bắt buộc)</label>
               <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field text-lg font-semibold" placeholder="Nhập tên đề tài khóa luận / BCTT..." autoFocus />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <label className="text-xs font-bold text-[var(--text-mutted)] uppercase mb-1 block">Chuyên ngành (Bắt buộc)</label>
                 <select value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} className="input-field">
                   <option value="">-- Chọn chuyên ngành --</option>
                   <option value="QLCN">Quản lý Công nghiệp (QLCN)</option>
                   <option value="ECom">Thương mại Điện tử (ECom)</option>
                   <option value="Log">Logistics (Log)</option>
                   <option value="KHQT">Kinh doanh Quốc tế (IntBus)</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-[var(--text-mutted)] uppercase mb-1 block">Lĩnh vực (Bắt buộc)</label>
                 <input type="text" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})} className="input-field" placeholder="VD: AI, Sản xuất, Web..." />
               </div>
               <div>
                 <label className="text-xs font-bold text-[var(--text-mutted)] uppercase mb-1 block">Khóa/Đợt (Tùy chọn)</label>
                 <input type="text" value={formData.dot} onChange={e => setFormData({...formData, dot: e.target.value})} className="input-field" placeholder="VD: Đợt 1 HK1 26-27..." />
               </div>
            </div>

            <div>
               <label className="text-xs font-bold text-[var(--text-mutted)] uppercase mb-1 block">Mô tả tóm tắt (Tùy chọn)</label>
               <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[100px]" placeholder="Viết vài dòng mô tả về công nghệ, yêu cầu đầu vào hoặc mục tiêu của đề tài..." />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
               <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy Bỏ</button>
               <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[150px]">
                 {isSubmitting ? 'Đang lưu...' : 'Lưu Đề Tài'}
               </button>
            </div>
          </form>
        </div>
      )}

      {topics.length === 0 ? (
        <div className="glass-panel p-16 text-center text-[var(--text-mutted)] animate-fade-in flex flex-col items-center">
          <svg className="w-16 h-16 text-indigo-500 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          <p className="text-lg">Bạn chưa đăng bất kỳ đề tài gợi ý nào.</p>
          <p className="text-sm mt-2 opacity-70">Các đề tài này sẽ xuất hiện trong danh sách lựa chọn của SV khi đăng ký.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map(topic => (
            <div key={topic.id} className="glass-panel p-6 border-transparent hover:border-indigo-500/30 transition-all group flex flex-col h-full bg-gradient-to-br hover:from-indigo-500/5 hover:to-transparent">
               <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                     <div className="flex gap-2">
                       <span className="badge badge-primary text-[9px] uppercase">{topic.major}</span>
                       <span className="badge badge-warning text-[9px] uppercase">{topic.field}</span>
                     </div>
                     <h3 className="text-lg font-bold text-[var(--text-color)] group-hover:text-indigo-500 transition-colors">{topic.title}</h3>
                  </div>
                  <button onClick={() => handleDelete(topic.id)} className="text-[var(--text-mutted)] hover:text-red-500 p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-red-500/10 transition-all" title="Xóa đề tài">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
               </div>
               
               <p className="text-sm text-[var(--text-mutted)] flex-1 line-clamp-3 mb-4 italic">
                  {topic.description || 'Không có mô tả chi tiết.'}
               </p>
               
               <div className="border-t border-[var(--glass-border)] pt-4 flex justify-between items-center text-xs text-[var(--text-mutted)]">
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {new Date(topic.createdAt).toLocaleDateString('vi-VN')}</span>
                  {topic.dot && <span className="font-bold text-slate-500 tracking-wider uppercase">Dành cho: {topic.dot}</span>}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
