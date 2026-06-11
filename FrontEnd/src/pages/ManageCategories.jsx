import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Bổ sung useNavigate
import defaultIcon from '../assets/no-image.png';
import { useManageCategories } from '../hooks/useManageCategories';

const ManageCategories = () => {
  const navigate = useNavigate(); // Khởi tạo điều hướng
  const {
    loading,
    search, setSearch,
    showModal, setShowModal,
    editingId,
    formData, setFormData,
    previewUrl,
    filteredCategories,
    handleOpenAdd,
    handleOpenEdit,
    handleFileChange,
    handleSubmit,
    handleDeleteCategory
  } = useManageCategories();

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* CỤM BÊN TRÁI: Nút Quay Lại + Tiêu đề */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
            >
              &larr; Quay lại
            </button>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
                <span className="bg-sky-100 p-2 rounded-xl shadow-sm">🗂️</span> Quản Trị Danh Mục
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Quản lý cây danh mục sản phẩm trên hệ thống.
              </p>
            </div>
          </div>
          
          {/* CỤM BÊN PHẢI: Thanh tìm kiếm + Thêm danh mục */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            <div className="relative flex-grow w-full lg:w-80">
              <input 
                type="text"
                placeholder="Tìm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-800 shadow-sm font-medium"
              />
              <span className="absolute right-4 top-3.5 opacity-50">🔍</span>
            </div>

            <button 
              onClick={handleOpenAdd}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/30 whitespace-nowrap text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <span>➕</span> Thêm Danh Mục
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-3xl border border-sky-200 overflow-hidden shadow-sm relative">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
              <thead className="bg-sky-50/80 text-sky-800 text-xs uppercase font-bold tracking-wider border-b-2 border-sky-200">
                <tr>
                  <th className="p-4 text-center w-24">Icon</th>
                  <th className="p-4 border-l border-sky-100">Tên Danh Mục</th>
                  <th className="p-4 text-center w-32 border-l border-sky-100">Số lượng SP</th>
                  <th className="p-4 text-center w-40 min-w-[150px] border-l border-sky-100">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredCategories.map((item) => (
                  <tr key={item._id} className="border-b border-sky-100 hover:bg-sky-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1.5 mx-auto border border-slate-200 shadow-sm">
                        <img 
                          src={item.image_url || defaultIcon} 
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => e.target.src = defaultIcon}
                        />
                      </div>
                    </td>
                    <td className="p-4 border-l border-sky-100/50">
                      <div className="font-bold text-slate-800 text-base md:text-lg group-hover:text-sky-600 transition-colors">{item.name}</div>
                    </td>
                    <td className="p-4 text-center border-l border-sky-100/50">
                      <span className="bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg text-sm font-bold text-sky-700 shadow-sm">
                        {item.productCount || 0}
                      </span>
                    </td>
                    
                    {/* Cột Thao tác */}
                    <td className="p-4 border-l border-sky-100/50 relative z-20">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="w-9 h-9 flex items-center justify-center bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-600 hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
                          title="Sửa danh mục"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(item._id, item.name)}
                          className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
                          title="Xóa danh mục"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredCategories.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="p-16 text-center">
                      <span className="text-6xl block mb-4">🔍</span>
                      <p className="text-slate-500 font-medium text-lg">Không tìm thấy danh mục nào.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white border-t border-sky-100">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-sky-700 font-bold animate-pulse">Đang tải dữ liệu danh mục...</span>
            </div>
          )}
        </div>

        {/* MODAL THÊM / SỬA DANH MỤC */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-sky-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              
              <div className="bg-sky-50/80 p-5 border-b border-sky-200 flex justify-between items-center">
                <h3 className="text-xl font-black text-sky-800 flex items-center gap-2">
                  {editingId ? "✏️ Cập nhật Danh Mục" : "✨ Thêm Danh Mục Mới"}
                </h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 transition-colors">
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-5">
                  <label className="block text-sm text-slate-700 font-bold mb-2">Tên danh mục <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all shadow-sm font-medium"
                    placeholder="VD: Điện thoại di động..."
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm text-slate-700 font-bold mb-2">Hình Ảnh Danh Mục</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 transition-all cursor-pointer shadow-sm"
                  />
                  {previewUrl && (
                    <div className="mt-4 w-24 h-24 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-center mx-auto">
                       <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" onError={(e) => e.target.src = defaultIcon} />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-sky-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors shadow-sm active:scale-95">
                    Hủy
                  </button>
                  <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-bold transition-colors shadow-md shadow-sky-500/30 active:scale-95">
                    {editingId ? "Lưu Thay Đổi" : "Tạo Mới"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;