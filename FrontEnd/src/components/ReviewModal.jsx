import React, { useState, useEffect } from 'react';

const ReviewModal = ({ isOpen, onClose, initialData, mode, onSubmit }) => {
  // mode: 'create' (Tạo mới), 'view' (Chỉ đọc), 'edit' (Sửa)
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({
    asin: '', title: '', overall: 5, summary: '', reviewText: ''
  });

  useEffect(() => {
    setCurrentMode(mode);
    if (initialData) {
      setFormData({
        asin: initialData.asin || '',
        title: initialData.title || initialData.productTitle || '',
        overall: initialData.overall || 5,
        summary: initialData.summary || '',
        reviewText: initialData.reviewText || ''
      });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const isReadOnly = currentMode === 'view';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, currentMode);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          {isReadOnly ? "📝 Đánh giá của bạn" : (currentMode === 'edit' ? "✏️ Chỉnh sửa đánh giá" : "⭐ Đánh giá sản phẩm")}
        </h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-2 font-medium italic">"{formData.title}"</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sao chấm điểm */}
          <div>
            <label className="block text-sm text-slate-700 font-bold mb-2">Chất lượng sản phẩm</label>
            <div className="flex gap-2 justify-center bg-sky-50/80 py-3 rounded-2xl border border-sky-100">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  type="button" key={star} disabled={isReadOnly}
                  onClick={() => setFormData({...formData, overall: star})}
                  className={`text-4xl transition-transform ${!isReadOnly && 'hover:scale-110'} ${
                    formData.overall >= star ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300'
                  }`}
                >★</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-700 font-bold mb-1">Tiêu đề (Tóm tắt)</label>
            <input 
              type="text" required readOnly={isReadOnly} value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 read-only:text-slate-500 read-only:bg-slate-50 read-only:border-slate-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 font-bold mb-1">Chi tiết trải nghiệm</label>
            <textarea 
              required rows="4" readOnly={isReadOnly} value={formData.reviewText}
              onChange={e => setFormData({...formData, reviewText: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none read-only:text-slate-500 read-only:bg-slate-50 read-only:border-slate-200 transition-all"
            ></textarea>
          </div>

          <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
            <div>
              {isReadOnly && (
                <button 
                  type="button" onClick={() => setCurrentMode('edit')}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-amber-600 border border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-1"
                >
                  ⚙️ Sửa lại
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                type="button" onClick={onClose} 
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                {isReadOnly ? "Đóng" : "Hủy"}
              </button>
              
              {!isReadOnly && (
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-500/30 transition-all"
                >
                  {currentMode === 'edit' ? "Lưu Thay Đổi" : "Gửi Đánh Giá"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;