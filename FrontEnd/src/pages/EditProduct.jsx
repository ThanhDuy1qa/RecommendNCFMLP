import React from 'react';
import { useEditProduct } from '../hooks/useEditProduct';

const EditProduct = () => {
  // 🌟 MỚI: Lấy thêm returnPath từ Hook
  const { formData, dbCategories, message, isLoading, isFetching, handleChange, handleSubmit, navigate, previewUrl, handleFileChange, returnPath } = useEditProduct();

  if (isFetching) {
    return (
      <div className="min-h-screen bg-sky-200 flex flex-col justify-center items-center text-sky-800 font-bold">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  }

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-3xl border border-sky-200 shadow-sm">
        
        {/* HEADER CÓ NÚT QUAY LẠI */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-sky-300 pb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
            <span className="bg-sky-100 p-2 rounded-xl shadow-sm">✏️</span> Chỉnh sửa Sản phẩm
          </h2>
          <button 
            onClick={() => navigate(returnPath)} 
            className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2 shrink-0"
          >
            &larr; Quay lại
          </button>
        </div>

        {message && (
          <div className="p-4 mb-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Các trường input CỘT TRÁI */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã ASIN *</label>
                <input 
                  type="text" name="asin" value={formData.asin} readOnly 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-500 cursor-not-allowed outline-none font-mono shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên sản phẩm *</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange} required 
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Thương hiệu</label>
                  <input 
                    type="text" name="brand" value={formData.brand} onChange={handleChange} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá bán ($) *</label>
                  <input 
                    type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required 
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-mono shadow-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Danh mục chính</label>
                <select 
                  name="main_cat" value={formData.main_cat} onChange={handleChange} 
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all cursor-pointer shadow-sm"
                >
                  {dbCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Các trường input CỘT PHẢI */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Thay đổi hình ảnh sản phẩm</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" 
                />
              </div>

              {/* Khu vực Review Ảnh */}
              <div className="w-full h-40 bg-sky-50/50 border-2 border-dashed border-sky-300 rounded-2xl flex items-center justify-center overflow-hidden p-2">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300/f8fafc/94a3b8?text=Lỗi+hiển+thị+ảnh";
                    }}
                  />
                ) : (
                  <span className="text-sky-600/60 text-sm font-bold">Chưa có ảnh (Preview)</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả sản phẩm</label>
                <textarea 
                  name="description" rows="3" value={formData.description} onChange={handleChange} 
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all custom-scrollbar shadow-sm resize-none" 
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-sky-100 mt-8">
            <button 
              type="button" 
              onClick={() => navigate(returnPath)} 
              className="w-full sm:w-1/3 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 py-3.5 rounded-xl font-bold transition-colors shadow-sm active:scale-95"
            >
              Hủy bỏ
            </button>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full sm:w-2/3 bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-sky-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isLoading ? "Đang xử lý tải lên..." : "💾 Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;