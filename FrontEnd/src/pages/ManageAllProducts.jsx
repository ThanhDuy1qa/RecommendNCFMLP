import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useManageAllProducts } from '../hooks/useManageAllProducts';

const ManageAllProducts = () => {
  const { products, loading, search, hasMore, handleSearchChange, loadMore, handleDeleteProduct } = useManageAllProducts();

  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
            <span>🛡️</span> Quản Trị Hệ Thống Sản Phẩm
          </h1>
          
          {/* BỔ SUNG NHÓM NÚT VÀ TÌM KIẾM Ở ĐÂY */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            
            {/* NÚT THÊM SẢN PHẨM CHO ADMIN */}
            <Link 
              to="/admin/add-product" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              + Thêm sản phẩm
            </Link>

            <div className="relative flex-grow md:w-80">
              <input 
                type="text"
                placeholder="Tìm nhanh theo tên hoặc ASIN..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none transition-all text-white"
              />
              <span className="absolute right-4 top-3 opacity-50">🔍</span>
            </div>
            
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 text-center">Ảnh</th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="p-4">Thương hiệu</th>
                <th className="p-4">Giá</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1 mx-auto shadow-sm">
                      <img 
                        src={item.image || defaultIcon} 
                        alt="" 
                        className="max-h-full object-contain"
                        onError={(e) => e.target.src = defaultIcon}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-100 line-clamp-1">{item.title}</div>
                    <div className="text-xs text-blue-400 font-mono mt-1">ASIN: {item.asin}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{item.brand}</td>
                  <td className="p-4 text-green-400 font-bold">{item.price}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <Link 
                        to={`/seller/edit-product/${item._id}`}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all text-sm font-semibold"
                      >
                        Sửa
                      </Link>
                      <button 
                        onClick={() => handleDeleteProduct(item._id)}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all text-sm font-semibold"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-10 text-center text-blue-400 animate-pulse font-bold">
              🚀 Hệ thống đang truy xuất dữ liệu lớn...
            </div>
          )}

          {!loading && hasMore && (
            <div className="p-6 text-center bg-slate-800/50">
              <button 
                onClick={loadMore}
                className="text-blue-400 hover:text-blue-300 font-bold border-b border-blue-400 pb-1 transition-all"
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