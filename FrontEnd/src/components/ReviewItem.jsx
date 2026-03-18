import React from 'react';

const ReviewItem = ({ review }) => {
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-600"}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4 hover:border-slate-500 transition-colors">
      
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-white font-bold text-sm">
            {review.reviewerName || "Người dùng ẩn danh"}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-sm flex">{renderStars(review.overall)}</div>
            <span className="text-slate-400 text-xs">{review.reviewTime}</span>
          </div>
        </div>
        
        {review.verified && (
          <span className="bg-green-900/50 text-green-400 text-[10px] px-2 py-1 rounded-sm font-semibold border border-green-800">
            Đã mua hàng
          </span>
        )}
      </div>

      <h5 className="text-blue-300 font-bold mb-1.5 text-sm">{review.summary}</h5>
      <p className="text-slate-300 text-sm leading-relaxed">{review.reviewText}</p>

      {/* ĐÃ SỬA: Kiểm tra an toàn cho Style */}
      {review.style && typeof review.style === 'object' && Object.keys(review.style).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap gap-2">
          {Object.entries(review.style).map(([key, value]) => (
            <span key={key} className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-600">
              {/* Ép kiểu String() trước khi trim() để tránh sập web */}
              {String(key).replace(':', '')}: <span className="text-slate-300">{String(value).trim()}</span>
            </span>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default ReviewItem;