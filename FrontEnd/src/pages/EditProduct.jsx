import React from 'react';
import { useEditProduct } from '../hooks/useEditProduct';

const EditProduct = () => {
  const { formData, dbCategories, message, isLoading, isFetching, handleChange, handleSubmit, navigate, previewUrl, handleFileChange } = useEditProduct();

  if (isFetching) {
    return <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">Đang tải dữ liệu sản phẩm...</div>;
  }

  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
          <span>✏️</span> Chỉnh sửa thông tin Sản phẩm
        </h2>

        {message && <div className="p-4 mb-6 rounded-lg bg-slate-900 border border-red-500/30 text-red-400">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mã ASIN *</label>
                <input type="text" name="asin" value={formData.asin} readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed outline-none" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên sản phẩm *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Thương hiệu</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Giá bán ($) *</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Danh mục chính</label>
                <select name="main_cat" value={formData.main_cat} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none">
                  {dbCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Thay đổi hình ảnh sản phẩm</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600/20 file:text-yellow-400 hover:file:bg-yellow-600/40 transition-all cursor-pointer" 
                />
              </div>

              {/* Khung hiển thị ảnh cũ hoặc ảnh mới chuẩn bị thay thế */}
              <div className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden p-2">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300/1e293b/475569?text=Lỗi+hiển+thị+ảnh";
                    }}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Chưa có ảnh (Preview)</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Mô tả sản phẩm</label>
            <textarea name="description" rows="5" value={formData.description} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button type="button" onClick={() => navigate('/seller/my-products')} className="w-1/3 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold transition-colors">
              Hủy bỏ
            </button>
            <button type="submit" disabled={isLoading} className="w-2/3 bg-yellow-600 hover:bg-yellow-500 text-slate-900 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-yellow-600/20">
              {isLoading ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;