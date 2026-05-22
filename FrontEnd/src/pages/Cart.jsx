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
      <div className="bg-slate-900 min-h-screen p-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">🛒 Giỏ hàng của bạn đang trống!</h2>
        <Link to="/" className="text-blue-400 hover:text-blue-300">Tiếp tục mua sắm &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-5xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">🛒 Giỏ Hàng Của Bạn</h1>
        
        {/* Nút Chọn tất cả */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-700 mb-4 px-2">
          <input 
            type="checkbox" 
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="w-5 h-5 cursor-pointer accent-blue-600"
          />
          <span className="font-semibold text-slate-300">Chọn tất cả ({cartItems.length} sản phẩm)</span>
        </div>

        <div className="divide-y divide-slate-700">
          {cartItems.map(item => (
            <div key={item.asin} className="py-4 flex items-center justify-between hover:bg-slate-800/50 px-2 rounded-lg transition-colors">
              
              {/* Checkbox + Thông tin SP */}
              <div className="flex items-center gap-4 w-1/2">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.asin)}
                  onChange={() => handleSelectItem(item.asin)}
                  className="w-5 h-5 cursor-pointer accent-blue-600"
                />
                <div className="w-16 h-16 bg-white rounded flex items-center justify-center p-1 shrink-0">
                  <img src={item.image || defaultIcon} alt="" className="max-h-full" />
                </div>
                <div>
                  <div className="font-bold line-clamp-2 text-slate-200">{item.title}</div>
                  <div className="text-sm text-slate-400 mt-1">Đơn giá: ${item.price}</div>
                </div>
              </div>

              {/* Tăng giảm số lượng + Xóa */}
              <div className="flex items-center gap-8">
                
                {/* Khu vực chỉnh số lượng */}
                <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(item.asin, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-3 py-1 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x border-slate-600 text-sm font-semibold w-12 text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.asin, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="font-bold text-green-400 w-20 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.asin)} 
                  className="text-red-400 hover:text-red-300 text-xl p-2 rounded hover:bg-slate-700 transition-colors" 
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Khu vực thanh toán */}
        <div className="flex justify-end mt-8">
          <button 
            onClick={handleNavigateToCheckout} 
            disabled={selectedItems.length === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:bg-slate-600 disabled:text-slate-400 disabled:shadow-none transition-all"
          >
            Mua Hàng Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;