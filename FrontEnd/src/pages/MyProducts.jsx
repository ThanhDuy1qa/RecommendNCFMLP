import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png'; 
import { useMyProducts } from '../hooks/useMyProducts';
const MyProducts = () => {
  // Gọi duy nhất 1 hook cấp page để lấy toàn bộ dữ liệu và hàm
  const {
    products, loading, handleDelete,
    topProducts, loadingTop,
    startIdx, handleNext, handlePrev, visibleTopProducts
  } = useMyProducts();

  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">📦 Quản lý Cửa Hàng</h1>
          <Link to="/admin/add-product" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20">
            + Thêm sản phẩm mới
          </Link>
        </div>

        {/* ====================================================
            KHU VỰC: TOP SẢN PHẨM BÁN CHẠY (CÓ MŨI TÊN TRƯỢT)
            ==================================================== */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <span>🔥</span> Top Sản Phẩm Bán Chạy Nhất
            </h2>
            
            {/* NHÓM NÚT BẤM MŨI TÊN CHUYỂN TRANG */}
            {!loadingTop && topProducts.length > 5 && (
              <div className="flex gap-2">
                <button 
                  onClick={handlePrev} 
                  disabled={startIdx === 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-600 transition-all
                    ${startIdx === 0 ? 'opacity-50 cursor-not-allowed text-slate-500' : 'hover:bg-slate-700 hover:border-yellow-500 text-yellow-400'}`}
                >
                  &#8592;
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={startIdx + 5 >= topProducts.length}
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-600 transition-all
                    ${startIdx + 5 >= topProducts.length ? 'opacity-50 cursor-not-allowed text-slate-500' : 'hover:bg-slate-700 hover:border-yellow-500 text-yellow-400'}`}
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>
          
          {loadingTop ? (
            <div className="animate-pulse bg-slate-800 h-40 rounded-2xl border border-slate-700"></div>
          ) : topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {visibleTopProducts.map((topProd, index) => (
                <div key={topProd.asin} className="bg-slate-800 p-4 rounded-xl border border-yellow-600/30 shadow-[0_0_15px_rgba(202,138,4,0.1)] hover:border-yellow-500 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 font-black text-sm px-3 py-1 rounded-br-lg z-10 shadow-md">
                    #{startIdx + index + 1}
                  </div>
                  
                  <div className="h-28 bg-white rounded-lg flex items-center justify-center p-2 mb-3 mt-4">
                    <img src={topProd.image || defaultIcon} alt={topProd.title} className="max-h-full object-contain group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 line-clamp-2 mb-2" title={topProd.title}>{topProd.title}</h3>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-400 font-bold">{topProd.price ? `$${topProd.price}` : 'Liên hệ'}</span>
                    <span className="text-yellow-400 font-bold">⭐ {topProd.avgRating}</span>
                  </div>
                  <div className="mt-2 text-xs text-center bg-slate-900/50 py-1.5 rounded text-blue-300 font-semibold border border-slate-700">
                    {topProd.totalSales} Lượt mua
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-slate-500 italic text-sm">Chưa có đủ dữ liệu tương tác để thống kê.</div>
          )}
        </div>

        {/* ====================================================
            KHU VỰC: BẢNG TẤT CẢ SẢN PHẨM
            ==================================================== */}
        <h2 className="text-xl font-bold text-slate-300 mb-4">📋 Toàn bộ Kho Hàng</h2>
        
        {loading ? (
          <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
        ) : products.length === 0 ? (
          <div className="bg-slate-800 p-10 rounded-2xl text-center border border-slate-700">
            <p className="text-slate-400">Bạn chưa có sản phẩm nào trong kho hàng.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
             <table className="w-full text-left">
              <thead className="bg-slate-700/50 text-slate-300 text-sm uppercase">
                <tr>
                  <th className="p-4 w-20 text-center">Hình ảnh</th>
                  <th className="p-4">Mã ASIN</th>
                  <th className="p-4">Tên sản phẩm</th>
                  <th className="p-4">Giá</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 shadow-sm mx-auto">
                        <img 
                          src={product.image_url_high || product.image_url || defaultIcon} 
                          alt={product.title} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { e.target.src = defaultIcon; }} 
                        />
                      </div>
                    </td>
                    <td className="p-4 font-mono text-blue-300 text-sm">{product.item_id}</td>
                    <td className="p-4 max-w-xs">
                      <div className="line-clamp-2" title={product.title}>
                        {product.title}
                      </div>
                    </td>
                    <td className="p-4 text-green-400 font-bold">
                      {product.price ? `$${product.price}` : <span className="text-yellow-400 font-normal">Liên hệ</span>}
                    </td>
                    <td className="p-4 text-sm text-slate-400">{product.main_cat}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <Link 
                          to={`/seller/edit-product/${product._id}`}
                          className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/10 rounded transition-colors" title="Chỉnh sửa">
                          ✏️ Sửa
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded transition-colors" title="Xóa sản phẩm">
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;