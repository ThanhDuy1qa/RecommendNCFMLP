import React from 'react';
import defaultIcon from '../assets/no-image.png';
import { useManageCategories } from '../hooks/useManageCategories';

const ManageCategories = () => {
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
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <span>🗂️</span> Quản Trị Danh Mục Sản Phẩm
          </h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={handleOpenAdd}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              + Thêm Danh Mục
            </button>

            <div className="relative flex-grow md:w-80">
              <input 
                type="text"
                placeholder="Tìm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:border-emerald-500 outline-none transition-all text-white"
              />
              <span className="absolute right-4 top-3 opacity-50">🔍</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative">
          <table className="w-full text-left">
            <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 text-center w-24">Icon</th>
                <th className="p-4">Tên Danh Mục</th>
                <th className="p-4 text-center">Số lượng SP</th>
                <th className="p-4 text-center w-48">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredCategories.map((item) => (
                <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 mx-auto shadow-sm">
                      <img 
                        src={item.image_url || defaultIcon} 
                        alt={item.name}
                        className="max-h-full object-contain"
                        onError={(e) => e.target.src = defaultIcon}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-100 text-lg">{item.name}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-slate-700 px-3 py-1 rounded-full text-sm font-semibold text-emerald-400">
                      {item.productCount || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg transition-all text-sm font-semibold"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(item._id, item.name)}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-1.5 rounded-lg transition-all text-sm font-semibold"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredCategories.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="p-10 text-center text-emerald-400 animate-pulse font-bold">
              🚀 Đang tải dữ liệu danh mục...
            </div>
          )}
        </div>

        {/* MODAL THÊM / SỬA DANH MỤC */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-slate-700/50 p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-emerald-400">
                  {editingId ? "✏️ Cập nhật Danh Mục" : "✨ Thêm Danh Mục Mới"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-slate-300 font-bold mb-2">Tên danh mục <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                    placeholder="VD: Điện thoại di động"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-slate-300 font-bold mb-2">Hình Ảnh Danh Mục</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                  />
                  {previewUrl && (
                    <div className="mt-3 w-16 h-16 bg-white rounded-lg p-1">
                       <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => e.target.src = defaultIcon} />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold transition-colors">
                    Hủy
                  </button>
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20">
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