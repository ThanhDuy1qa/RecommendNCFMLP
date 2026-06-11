import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useCartPage } from '../hooks/useCartPage'; // Import hook logic mới tạo

const Cart = () => {
  // Lấy toàn bộ dữ liệu và hàm xử lý từ Custom Hook
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    selectedItems, 
    isAllSelected, 
    handleSelectAll, 
    handleSelectItem, 
    handleNavigateToCheckout
  } = useCartPage();
  
  // Xử lý giao diện giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="bg-sky-200 min-h-screen p-10 text-center text-slate-800">
        <h2 className="text-2xl font-bold mb-4">🛒 Giỏ hàng của bạn đang trống!</h2>
        <Link to="/" className="text-sky-700 hover:text-sky-800 font-bold">Tiếp tục mua sắm &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Tiêu đề & Chọn tất cả */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-sky-700">🛒 Giỏ hàng ({cartItems.length})</h2>
          
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isAllSelected} 
              onChange={handleSelectAll}
              className="w-5 h-5 accent-sky-600 cursor-pointer"
            />
            <span className="font-bold text-slate-600">Chọn tất cả</span>
          </label>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.asin} className="flex flex-col sm:flex-row items-center gap-4 bg-sky-50/60 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all">
              
              {/* Checkbox */}
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.asin)} 
                onChange={() => handleSelectItem(item.asin)}
                className="w-5 h-5 accent-sky-600 cursor-pointer shrink-0"
              />

              {/* Hình ảnh */}
              <div className="w-20 h-20 bg-white rounded-lg p-1 shrink-0 border border-slate-200 flex items-center justify-center">
                <img 
                  src={item.image || defaultIcon} 
                  alt={item.title} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.src = defaultIcon; }}
                />
              </div>

              {/* Tên & Giá lẻ */}
              <div className="flex-1 text-center sm:text-left">
                <Link to={`/product/${item.asin}`} className="text-sm sm:text-base font-bold text-slate-800 hover:text-sky-600 line-clamp-2 transition-colors">
                  {item.title}
                </Link>
                <div className="text-slate-500 font-medium text-sm mt-1">${item.price}</div>
              </div>

              {/* Số lượng */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm">
                <button 
                  onClick={() => updateQuantity(item.asin, item.quantity - 1)}
                  className="px-3 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                >
                  -
                </button>
                <span className="font-bold w-10 text-center text-slate-800">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.asin, item.quantity + 1)}
                  className="px-3 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                >
                  +
                </button>
              </div>

              {/* Tổng tiền món */}
              <div className="font-black text-rose-600 w-20 text-right text-lg shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              
              {/* Nút Xóa */}
              <button 
                onClick={() => removeFromCart(item.asin)} 
                className="text-slate-400 hover:text-rose-600 text-xl p-2 rounded-lg hover:bg-rose-50 transition-colors shrink-0" 
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Khu vực thanh toán */}
        <div className="flex justify-end mt-8 border-t border-slate-200 pt-6">
          <button 
            onClick={handleNavigateToCheckout} 
            disabled={selectedItems.length === 0}
            className="bg-sky-600 hover:bg-sky-500 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none transition-all"
          >
            Thanh toán {selectedItems.length > 0 ? `(${selectedItems.length})` : ''} &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;