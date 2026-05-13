import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../assets/no-image.png';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Xử lý ảnh lỗi hoặc không có ảnh
  const imgSrc = product.image || defaultImg;

  return (
    <div 
      onClick={() => navigate(`/product/${product.asin}`)}
      // Thêm 'group' để bắt sự kiện hover cho các phần tử con. 
      // Bỏ các hiệu ứng làm thay đổi kích thước thẻ ở đây.
      className="relative group bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors duration-300 flex flex-col h-full"
    >
      {/* ==========================================
          1. THẺ CHÍNH (LUÔN GIỮ KÍCH THƯỚC CỐ ĐỊNH)
          ========================================== */}
      <div className="p-3 flex flex-col h-full items-center">
        {/* Khung ảnh cố định tỷ lệ 1:1 */}
        <div className="w-full aspect-square bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
          <img 
            src={imgSrc} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }}
          />
        </div>
        
        {/* Thương hiệu (Cắt chữ nếu quá dài) */}
        <span className="text-[10px] sm:text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1 text-center w-full truncate">
          {product.brand && product.brand !== "N/A" ? product.brand : "AMAZON"}
        </span>
        
        {/* Tiêu đề (Đóng băng 2 dòng bằng line-clamp-2, thêm min-h để các thẻ luôn bằng nhau) */}
        <h3 className="text-xs sm:text-sm text-slate-200 font-medium text-center line-clamp-2 mb-2 w-full min-h-[32px] sm:min-h-[40px]">
          {product.title}
        </h3>
        
        {/* Giá tiền */}
        <div className="text-sm sm:text-base text-yellow-400 font-bold mt-auto">
          {product.price}
        </div>
      </div>

      {/* ==========================================
          2. Ô NỔI THÔNG TIN (POPOVER GÓC PHẢI)
          ========================================== */}
      {/* Mặc định tàng hình (opacity-0 invisible), khi hover vào 'group' thì hiện lên.
          Thuộc tính absolute và z-[100] giúp nó nổi lên trên mọi thứ mà không đẩy layout */}
      <div 
        className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] 
                   bg-slate-900 border border-blue-500 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.4)] 
                   w-64 p-4 pointer-events-none
                   /* Định vị: Góc trên cùng, lòi ra ngoài viền phải của thẻ gốc một chút */
                   top-[-10px] left-[90%] 
                   /* Tạo hiệu ứng trượt nhẹ từ phải sang trái khi xuất hiện */
                   translate-x-2 group-hover:translate-x-4"
      >
        <p className="text-[10px] text-blue-400 font-mono mb-1">ASIN: {product.asin}</p>
        
        {/* Tiêu đề full không bị cắt */}
        <p className="text-sm text-white font-medium mb-3 leading-relaxed">
          {product.title}
        </p>
        
        <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-700">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 mb-0.5">Thương hiệu</span>
            <span className="text-xs text-slate-200 font-bold truncate max-w-[100px]">
              {product.brand && product.brand !== "N/A" ? product.brand : "Không rõ"}
            </span>
          </div>
          <span className="text-lg text-yellow-400 font-black">{product.price}</span>
        </div>
      </div>
      
    </div>
  );
};

export default ProductCard;