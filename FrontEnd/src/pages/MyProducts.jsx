import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png'; 
import { useMyProducts } from '../hooks/useMyProducts';

const MyProducts = () => {
  const {
    products, loading, handleDelete, handleExportCSV,
    topProducts, loadingTop,
    startIdx, handleNext, handlePrev, visibleTopProducts,
    getCategoryImage // 🌟 IMPORT HÀM TÌM ẢNH
  } = useMyProducts();

  const renderInventoryBadge = (action) => {
    switch (action) {
      case 'priority_import':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap w-max">🚀 Ưu tiên nhập</span>;
      case 'consider_import':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap w-max">🤔 Cân nhắc nhập</span>;
      case 'avoid_import':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap w-max">⚠️ Tránh nhập nhiều</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 border border-slate-600 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap w-max">👀 Theo dõi thêm</span>;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-700 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-400 flex items-center gap-3">
              <span>📦</span> Quản lý Cửa Hàng Thông Minh
            </h1>
            <p className="text-sm text-slate-400 mt-2">Toàn bộ kho hàng của bạn đã được đính kèm dự báo từ Trí tuệ Nhân tạo.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg text-sm"
            >
              📥 In Danh Sách (CSV)
            </button>
            <Link to="/admin/add-product" className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
              + Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* TOP SẢN PHẨM */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <span>🔥</span> Top Sản Phẩm Bán Chạy Nhất
            </h2>
            {!loadingTop && topProducts.length > 5 && (
              <div className="flex gap-2">
                <button onClick={handlePrev} disabled={startIdx === 0} className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-600 transition-all ${startIdx === 0 ? 'opacity-50 cursor-not-allowed text-slate-500' : 'hover:bg-slate-700 hover:border-yellow-500 text-yellow-400'}`}>&#8592;</button>
                <button onClick={handleNext} disabled={startIdx + 5 >= topProducts.length} className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-600 transition-all ${startIdx + 5 >= topProducts.length ? 'opacity-50 cursor-not-allowed text-slate-500' : 'hover:bg-slate-700 hover:border-yellow-500 text-yellow-400'}`}>&#8594;</button>
              </div>
            )}
          </div>
          
          {loadingTop ? (
            <div className="animate-pulse bg-slate-800 h-40 rounded-2xl border border-slate-700"></div>
          ) : topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {visibleTopProducts.map((topProd, index) => (
                <div key={topProd.asin} className="bg-slate-800 p-4 rounded-xl border border-yellow-600/30 shadow-[0_0_15px_rgba(202,138,4,0.1)] hover:border-yellow-500 transition-all relative overflow-hidden group flex flex-col justify-between">
                  <div>
                    <div className="absolute top-0 left-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 font-black text-sm px-3 py-1 rounded-br-lg z-10 shadow-md">
                      #{startIdx + index + 1}
                    </div>
                    <div className="h-28 bg-white rounded-lg flex items-center justify-center p-2 mb-3 mt-4">
                      <img src={topProd.image || defaultIcon} alt="" className="max-h-full object-contain group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-2 mb-1" title={topProd.title}>{topProd.title}</h3>
                    
                    {/* 🌟 HIỂN THỊ ẢNH DANH MỤC Ở TOP SẢN PHẨM */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {getCategoryImage(topProd.main_cat) ? (
                        <img src={getCategoryImage(topProd.main_cat)} alt="" className="w-3.5 h-3.5 rounded-full object-cover bg-white" />
                      ) : (
                        <span className="text-[10px]">📁</span>
                      )}
                      <p className="text-[10px] text-slate-400 truncate">
                        {topProd.main_cat || "Chưa phân loại"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2 border-t border-slate-700 pt-2">
                    <span className="text-green-400 font-bold">{topProd.price ? `$${topProd.price}` : 'Liên hệ'}</span>
                    <span className="text-yellow-400 font-bold">⭐ {topProd.avgRating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-slate-500 italic text-sm">Chưa có đủ dữ liệu tương tác để thống kê.</div>
          )}
        </div>

        {/* BẢNG TẤT CẢ SẢN PHẨM & AI */}
        <h2 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
          <span>📋</span> Toàn Bộ Danh Sách Phân Tích
        </h2>
        
        {loading ? (
          <div className="text-center py-10 text-slate-400 font-bold animate-pulse">Đang đồng bộ dữ liệu...</div>
        ) : products.length === 0 ? (
          <div className="bg-slate-800 p-10 rounded-2xl text-center border border-slate-700">
            <p className="text-slate-400">Bạn chưa có sản phẩm nào trong kho hàng.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-900 text-slate-400 text-xs font-bold uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-4 w-20 text-center">Ảnh</th>
                    <th className="p-4 w-1/4">Thông tin Sản phẩm</th>
                    <th className="p-4 text-center w-36">Danh mục</th>
                    <th className="p-4 text-right w-24">Giá bán</th>
                    <th className="p-4 border-l border-slate-700 bg-indigo-900/10 text-center w-32">Lượt tiếp cận<br/><span className="text-[9px] font-normal">(AI Target)</span></th>
                    <th className="p-4 bg-indigo-900/10 w-48 text-center">Tư vấn Nhập hàng</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 shadow-sm mx-auto">
                          <img 
                            src={product.image_url_high || product.image_url || defaultIcon} 
                            alt="" className="max-w-full max-h-full object-contain"
                            onError={(e) => { e.target.src = defaultIcon; }} 
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200 line-clamp-2 mb-1" title={product.title}>
                          {product.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded font-bold">
                            Mã: {product.item_id || product.asin}
                          </span>
                        </div>
                      </td>

                      {/* 🌟 CỘT 3: THAY ICON THƯ MỤC BẰNG HÌNH ẢNH DANH MỤC TỪ DATABASE */}
                      <td className="p-4 text-center">
                        <span 
                          className="bg-slate-700/60 text-slate-300 text-[11px] font-semibold px-2 py-1 rounded inline-flex items-center justify-center gap-1.5 border border-slate-600 max-w-[120px] truncate"
                          title={product.main_cat || "Chưa phân loại"}
                        >
                          {getCategoryImage(product.main_cat) ? (
                            <img src={getCategoryImage(product.main_cat)} alt="cat" className="w-4 h-4 rounded-full object-cover bg-white" />
                          ) : (
                            "📁" // Nếu danh mục không có ảnh thì fallback về icon thư mục
                          )}
                          <span className="truncate">{product.main_cat || "Chưa phân loại"}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right font-bold text-green-400 font-mono">
                        {product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'N/A'}
                      </td>
                      
                      <td className="p-4 border-l border-slate-700 bg-indigo-900/5 text-center">
                        <span className={`font-black text-lg ${product.ai_predicted_users > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                          {product.ai_predicted_users > 0 ? product.ai_predicted_users.toLocaleString() : '-'}
                        </span>
                        <div className="text-[10px] text-slate-500 uppercase mt-1">Users</div>
                      </td>

                      {/* Cột 6: AI - HÀNH ĐỘNG */}
                      <td className="p-4 bg-indigo-900/5">
                        <div className="flex flex-col gap-2 items-center">
                          {renderInventoryBadge(product.ai_inventory_action)}
                          
                          {/* 🌟 NẾU SẢN PHẨM NẰM TRONG CHIẾN DỊCH ADS -> HIỆN NÚT TẢI CSV */}
                          {product.ai_is_marketing && (
                            <div className="flex flex-col items-center gap-1.5 mt-1 border-t border-indigo-500/20 pt-2 w-full">
                              <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm w-max">
                                🎯 Nằm trong Ads
                              </span>
                              
                              <button 
                                onClick={() => handleDownloadCustomers(product.item_id || product.asin, product.title)}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-1.5 rounded-md font-bold shadow-md transition-all active:scale-95 flex items-center gap-1"
                              >
                                📥 Tải tệp (CSV)
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 w-max mx-auto">
                          <Link 
                            to={`/seller/edit-product/${product._id}`}
                            className="text-blue-400 hover:text-white bg-blue-900/20 hover:bg-blue-600 px-3 py-1.5 rounded transition-colors text-xs font-bold text-center border border-blue-500/30">
                            ✏️ Sửa
                          </Link>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="text-red-400 hover:text-white bg-red-900/20 hover:bg-red-600 px-3 py-1.5 rounded transition-colors text-xs font-bold text-center border border-red-500/30">
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;