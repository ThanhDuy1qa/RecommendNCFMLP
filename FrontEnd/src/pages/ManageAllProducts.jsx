import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useManageAllProducts } from '../hooks/useManageAllProducts';

const ManageAllProducts = () => {
  const navigate = useNavigate();
  // 🌟 ĐÃ SỬA: Lấy thêm categories, selectedCategory, handleCategoryChange từ Hook
  const { 
    products, loading, search, hasMore, handleSearchChange, loadMore, handleDeleteProduct,
    categories, selectedCategory, handleCategoryChange 
  } = useManageAllProducts();

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* --- CỤM BÊN TRÁI: Nút Quay Lại + Tiêu đề --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
            >
              &larr; Quay lại
            </button>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
                <span className="bg-sky-100 p-2 rounded-xl shadow-sm">🛡️</span> Quản Trị Hệ Thống Sản Phẩm
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Quản lý toàn bộ danh sách sản phẩm trên sàn thương mại điện tử.
              </p>
            </div>
          </div>
          
          {/* --- CỤM BÊN PHẢI: Tìm kiếm + Lọc Danh Mục + Nút Thêm --- */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            
            {/* 🌟 THÊM MỚI: BỘ LỌC DANH MỤC */}
            <select 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-700 shadow-sm font-bold cursor-pointer appearance-none"
            >
              <option value="">📁 Tất cả danh mục</option>
              {categories?.map((cat, idx) => (
                <option key={cat._id || idx} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <div className="relative flex-grow w-full lg:w-64">
              <input 
                type="text"
                placeholder="Tìm tên, ASIN..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-800 shadow-sm font-medium"
              />
              <span className="absolute right-4 top-3.5 opacity-50">🔍</span>
            </div>

            {/* NÚT THÊM SẢN PHẨM CHO ADMIN */}
            <Link 
              to="/admin/add-product" 
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/30 whitespace-nowrap text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <span>➕</span> Thêm Mới
            </Link>
            
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-3xl border border-sky-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead className="bg-sky-50/80 text-sky-800 text-xs uppercase font-bold tracking-wider border-b-2 border-sky-200">
                <tr>
                  <th className="p-4 w-[100px] text-center">Ảnh</th>
                  <th className="p-4 w-[40%]">Thông tin sản phẩm</th>
                  <th className="p-4 w-[150px] border-l border-sky-100">Danh mục & Brand</th>
                  <th className="p-4 w-[120px] text-right border-l border-sky-100">Giá</th>
                  <th className="p-4 w-[150px] min-w-[150px] text-center border-l border-sky-100">Thao tác</th>
                </tr>
              </thead>
              
              <tbody className="text-sm">
                {products.map((item) => (
                  <tr key={item._id} className="border-b border-sky-100 hover:bg-sky-50/50 transition-colors group">
                    
                    {/* Ảnh */}
                    <td className="p-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-1.5 mx-auto border border-slate-200 shadow-sm">
                        <img 
                          src={item.image || defaultIcon} 
                          alt={item.title} 
                          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => e.target.src = defaultIcon}
                        />
                      </div>
                    </td>

                    {/* Thông tin sản phẩm */}
                    <td className="p-4 pr-6">
                      <div className="font-bold text-slate-800 line-clamp-2 mb-1.5 leading-snug group-hover:text-sky-600 transition-colors" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[10px] text-sky-700 font-mono font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md shadow-sm w-fit">
                        Mã: {item.asin}
                      </div>
                    </td>

                    {/* Danh mục & Thương hiệu */}
                    <td className="p-4 border-l border-sky-100/50">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg shadow-sm line-clamp-1 truncate" title={item.main_cat}>
                          📁 {item.main_cat || 'Chưa phân loại'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 px-1 truncate" title={item.brand}>
                          Hãng: {item.brand || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Giá */}
                    <td className="p-4 text-right font-black text-emerald-600 font-mono text-base border-l border-sky-100/50">
                      ${item.price}
                    </td>

                    {/* Thao tác */}
                    <td className="p-4 border-l border-sky-100/50 relative z-20">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`/seller/edit-product/${item._id}`}
                          className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-white bg-sky-50 hover:bg-sky-600 rounded-xl transition-colors text-sm font-bold border border-sky-200 shadow-sm"
                          title="Sửa sản phẩm"
                        >
                          ✏️
                        </Link>
                        
                        <button 
                          onClick={() => handleDeleteProduct(item._id)}
                          className="w-9 h-9 flex items-center justify-center text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-colors text-sm font-bold border border-rose-200 shadow-sm"
                          title="Xóa sản phẩm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
                
                {/* Trạng thái Trống (Empty State) */}
                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <span className="text-6xl block mb-4">🔍</span>
                      <p className="text-slate-500 font-medium text-lg">Không tìm thấy sản phẩm nào khớp với tìm kiếm.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-sky-700 font-bold animate-pulse">Hệ thống đang truy xuất dữ liệu...</span>
            </div>
          )}

          {/* Nút Tải Thêm */}
          {!loading && hasMore && (
            <div className="p-6 text-center bg-white border-t border-sky-100 pb-8">
              <button 
                onClick={loadMore}
                className="bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-400 px-8 py-2.5 rounded-full font-bold transition-all shadow-sm active:scale-95"
              >
                Tải thêm kết quả
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAllProducts;