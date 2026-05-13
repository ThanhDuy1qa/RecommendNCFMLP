import React from 'react';
import { useEditProduct } from '../hooks/useEditProduct';

const EditProduct = () => {
  const { formData, dbCategories, message, isLoading, isFetching, handleChange, handleSubmit, navigate } = useEditProduct();

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
                <label className="block text-sm text-slate-400 mb-1">Mã ASIN (Mã định danh)</label>
                <input required name="item_id" value={formData.item_id} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 text-slate-500 rounded-lg p-3 cursor-not-allowed" disabled />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên sản phẩm *</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Thương hiệu (Brand) *</label>
                <input required name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Giá bán ($)</label>
                <input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Danh mục chính</label>
                <select name="main_cat" value={formData.main_cat} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                  {dbCategories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Link Hình ảnh (URL)</label>
                <input type="text" name="image_url_high" value={formData.image_url_high} onChange={handleChange} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none" />
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
            <button type="submit" disabled={isLoading} className="w-2/3 bg-yellow-600 hover:bg-yellow-500 text-slate-900 py-3 rounded-lg font-bold shadow-lg shadow-yellow-500/20 transition-colors">
              {isLoading ? "Đang lưu thay đổi..." : "💾 Cập nhật Sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;