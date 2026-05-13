import React from 'react';
import { useAddProduct } from '../hooks/useAddProduct';

const AddProduct = () => {
  // GỌI NÃO BỘ RA ĐÂY
  const { formData, dbCategories, message, isLoading, handleChange, handleSubmit } = useAddProduct();

  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-2">
          <span>📦</span> Quản lý Kho hàng
        </h2>

        {message && <div className="p-4 mb-6 rounded-lg bg-slate-900 border border-blue-500/30 text-blue-400 font-semibold">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CỘT TRÁI */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mã ASIN *</label>
                <input required name="item_id" value={formData.item_id} onChange={handleChange} placeholder="Ví dụ: B00001P4XA" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên sản phẩm *</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Thương hiệu</label>
                <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Ví dụ: Koss" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Danh mục chính</label>
                  <select name="main_cat" value={formData.main_cat} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors">
                    {dbCategories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Giá ($) *</label>
                  <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (Chứa Ảnh và Mô tả) */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Link ảnh sản phẩm (URL) *</label>
                <input required name="image_url_high" value={formData.image_url_high} onChange={handleChange} placeholder="https://images-na.ssl-images-amazon.com/..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              {/* Khu vực Preview Ảnh */}
              <div className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.image_url_high ? (
                  <img 
                    src={formData.image_url_high} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300/1e293b/475569?text=Lỗi+hiển+thị+ảnh";
                    }}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Chưa có ảnh (Preview)</span>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Mô tả chi tiết</label>
                <textarea name="description" rows="5" value={formData.description} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors custom-scrollbar" />
              </div>
            </div>

          </div>

          <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-3.5 rounded-lg font-bold text-lg shadow-lg shadow-blue-500/20 transition-all">
            {isLoading ? "⏳ Đang xử lý..." : "➕ Thêm Sản Phẩm Mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;