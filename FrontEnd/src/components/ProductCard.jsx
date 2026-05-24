import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../assets/no-image.png';
import { useCart } from '../hooks/useCart'; // Import hook giỏ hàng

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Lấy hàm addToCart

  // Xử lý ảnh lỗi hoặc không có ảnh
  const imgSrc = product.image || defaultImg;

  // Xử lý sự kiện thêm vào giỏ hàng
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Cực kỳ quan trọng: Ngăn không cho click lan ra thẻ div ngoài cùng (tránh nhảy trang)
    addToCart(product);
    // Tùy chọn: Bạn có thể thêm 1 thư viện Toast (như react-toastify) để hiện thông báo ở đây
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.asin}`)}
      className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500 transition-all duration-300 group flex flex-col cursor-pointer h-full relative"
    >
      {/* ==========================================
          1. KHU VỰC HÌNH ẢNH (Tỷ lệ vuông)
          ========================================== */}
      <div className="relative aspect-square p-3 sm:p-4 bg-white flex items-center justify-center overflow-hidden">
        <img 
          src={imgSrc} 
          alt={product.title} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }}
        />
      </div>
        
      {/* ==========================================
          2. KHU VỰC THÔNG TIN SẢN PHẨM
          ========================================== */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 border-t border-slate-700">
        
        {/* Thương hiệu */}
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 truncate">
          {product.brand && product.brand !== "N/A" ? product.brand : "Thương hiệu đối tác"}
        </p>
        
        {/* Tiêu đề */}
        <h3 
          className="font-bold text-slate-200 text-xs sm:text-sm mb-2 line-clamp-2 leading-snug flex-1" 
          title={product.title}
        >
          {product.title}
        </h3>
        
        {/* Đánh giá (Giả lập giống SmartCatalog) */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-xs">★★★★☆</span>
        </div>

        {/* Giá tiền và Nút Thêm giỏ hàng */}
        <div className="flex items-end justify-between mt-auto">
          <div className="font-black text-sm sm:text-lg text-yellow-400">
            {product.price}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded-lg transition-colors"
            title="Thêm vào giỏ hàng"
          >
            {/* Icon Giỏ hàng */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;