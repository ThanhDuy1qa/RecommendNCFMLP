import React, { useContext } from 'react'; // 🌟 ĐÃ SỬA: Import thêm useContext
import { Link } from 'react-router-dom';
import { useAddProduct } from '../hooks/useAddProduct';
import { AuthContext } from '../context/AuthContext'; // 🌟 ĐÃ SỬA: Import AuthContext để lấy Role

const AddProduct = () => {
  const { formData, dbCategories, message, isLoading, handleChange, handleSubmit, previewUrl, handleFileChange } = useAddProduct();
  
  // 🌟 Lấy thông tin user hiện tại để xác định đường dẫn quay lại
  const { user } = useContext(AuthContext);
  const returnPath = user?.role === 2 ? '/admin/manage-products' : '/seller/my-products';

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-3xl border border-sky-200 shadow-sm">
        
        {/* HEADER CÓ NÚT QUAY LẠI */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-sky-300 pb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
            <span className="bg-sky-100 p-2 rounded-xl shadow-sm">📦</span> Thêm Sản Phẩm Mới
          </h2>
          <Link 
            to={returnPath} // 🌟 ĐÃ SỬA: Tự động nhận diện Admin hay Seller để quay về đúng kho hàng
            className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2 shrink-0"
          >
            &larr; Kho sản phẩm
          </Link>
        </div>

        {message && (
          <div className="p-4 mb-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CỘT TRÁI */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã ASIN *</label>
                <input required name="asin" value={formData.asin} onChange={handleChange} placeholder="Ví dụ: B00001P4XA..." className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên sản phẩm *</label>
                <input required name="title" value={formData.title} onChange={handleChange} placeholder="Nhập tên sản phẩm..." className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá ($) *</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Thương hiệu</label>
                  <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Tên hãng..." className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Danh mục chính *</label>
                <select required name="main_cat" value={formData.main_cat} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all cursor-pointer shadow-sm">
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {dbCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tải Ảnh Sản Phẩm Lên</label>
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
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả chi tiết</label>
                <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all custom-scrollbar shadow-sm resize-none" placeholder="Nhập mô tả sản phẩm..." />
              </div>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full mt-8 bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-sky-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isLoading ? "Đang xử lý tải lên Cloudinary..." : "💾 Lưu Sản Phẩm Mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;