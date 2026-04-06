import React from 'react';
import { Link } from 'react-router-dom';
import defaultImg from '../assets/no-image.png'; 

const ProductCard = ({ product }) => {
  const fallbackImg = defaultImg;

  return (
    // Dùng h-fit để thẻ luôn ôm sát nội dung. 
    // Khi nội dung phình to, thẻ sẽ phình to và đẩy các thẻ khác xuống.
    <Link 
      to={`/product/${product.asin}`} 
      className="flex flex-col w-full h-fit rounded-md border-2 border-gray-600 bg-slate-900 overflow-hidden group hover:border-blue-400 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-colors duration-300"
    >
        {/* Khung Ảnh */}
        <div className="h-32 sm:h-40 w-full bg-white flex items-center justify-center p-2">
          <img
            src={product.image || fallbackImg}
            alt={product.title}
            // Zoom nhẹ ảnh khi hover
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        </div>

        {/* Nội dung tĩnh và động */}
        <div className="flex flex-col p-2 text-center bg-slate-900">

          {/* Dòng Brand (Mặc định ẩn, hiện khi hover) */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
            <div className="overflow-hidden">
                <div className="text-[8px] sm:text-[9px] text-blue-400 font-mono uppercase tracking-widest bg-blue-900/30 inline-block px-1.5 py-0.5 rounded w-fit mb-1.5 mt-1">
                  {product.brand || "NO BRAND"}
                </div>
            </div>
          </div>

          {/* Tiêu đề */}
          {/* Mặc định giới hạn 2 dòng (line-clamp-2). Khi hover thì xóa giới hạn (line-clamp-none) để chữ đẩy cao lên */}
          <h3 className="text-white font-semibold text-[10px] sm:text-[11px] leading-tight line-clamp-2 group-hover:line-clamp-none transition-all duration-300 group-hover:text-blue-300">
            {product.title}
          </h3>

          {/* Giá */}
          <div className="text-yellow-400 font-mono font-bold text-xs sm:text-sm mt-1.5">
            {product.price !== "Liên hệ" ? product.price : "N/A"}
          </div>

          {/* Danh mục (Mặc định ẩn, hiện trượt xuống khi hover) */}
          {Array.isArray(product.category) && product.category.length > 0 && (
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
              <div className="overflow-hidden">
                <div className="border-t border-slate-700 pt-2 mt-1.5 flex flex-wrap justify-center gap-1">
                  {product.category.slice(-2).map((cat, idx) => (
                    <span key={idx} className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] whitespace-nowrap">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
    </Link>
  );
};

export default ProductCard;