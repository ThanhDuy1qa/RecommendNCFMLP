import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../assets/no-image.png';
import { useCart } from '../hooks/useCart';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const imgSrc = product.image || defaultImg;

  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    addToCart(product);
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.asin}`)}
      className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-400 transition-all duration-300 group flex flex-col cursor-pointer h-full relative"
    >
      {/* 1. KHU VỰC HÌNH ẢNH */}
      <div className="relative aspect-square p-4 bg-gradient-to-br from-sky-50 via-white to-orange-50 flex items-center justify-center overflow-hidden">
        <img 
          src={imgSrc} 
          alt={product.title} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }}
        />

      </div>
        
      {/* 2. KHU VỰC THÔNG TIN SẢN PHẨM */}
      <div className="p-4 flex flex-col flex-1 border-t border-sky-100 bg-white">
        <p className="text-[10px] font-black text-sky-700 uppercase tracking-wider mb-1 truncate">
          {product.brand && product.brand !== "N/A" ? product.brand : "Thương hiệu đối tác"}
        </p>
        
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-3 line-clamp-2 leading-snug flex-1 group-hover:text-sky-700 transition-colors" title={product.title}>
          {product.title}
        </h3>

        {/* 3. KHỐI THÔNG SỐ AI */}
        {product.hybrid_score !== undefined && (
          <div className="mb-3 pt-2 border-t border-sky-200">
            <p className="text-xs text-slate-700 uppercase font-black mb-2 flex items-center gap-1">
              <span>🤖</span> Phân tích Thuật toán
            </p>
            
            <div className="grid grid-cols-2 gap-2 font-mono">
              {product.hybrid_score !== undefined && (
                <div className="bg-amber-50 text-amber-700 px-2 py-1.5 rounded-lg border border-amber-200 flex flex-col" title="Hybrid Model (GMF + MLP + Attention)">
                  <span className="opacity-80 text-[11px] leading-none mb-1 font-bold">HYBRID</span>
                  <span className="font-black text-base">{product.hybrid_score.toFixed(4)}</span>
                </div>
              )}
              {product.ae_norm !== undefined && (
                <div className="bg-sky-50 text-sky-700 px-2 py-1.5 rounded-lg border border-sky-200 flex flex-col">
                  <span className="opacity-80 text-[11px] leading-none mb-1 font-bold">AE_NORM</span>
                  <span className="font-black text-base">{product.ae_norm.toFixed(4)}</span>
                </div>
              )}
              {product.ncf_norm !== undefined && (
                <div className="bg-emerald-50 text-emerald-700 px-2 py-1.5 rounded-lg border border-emerald-200 flex flex-col">
                  <span className="opacity-80 text-[11px] leading-none mb-1 font-bold">NCF_NORM</span>
                  <span className="font-black text-base">{product.ncf_norm.toFixed(4)}</span>
                </div>
              )}
              {product.mlp_norm !== undefined && (
                <div className="bg-purple-50 text-purple-700 px-2 py-1.5 rounded-lg border border-purple-200 flex flex-col">
                  <span className="opacity-80 text-[11px] leading-none mb-1 font-bold">MLP_NORM</span>
                  <span className="font-black text-base">{product.mlp_norm.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Giá tiền và Nút Thêm giỏ hàng */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="font-black text-lg text-rose-500">
            {product.price}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-teal-100 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm"
            title="Thêm vào giỏ hàng"
          >
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