import React from 'react';

const ReviewItem = ({ review }) => {
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <span key={index} className={index < rating ? "text-amber-400" : "text-slate-200"}>
        ★
      </span>
    ));
  };
  
  return (
    <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200 mb-4 hover:border-sky-400 shadow-sm transition-colors">
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-slate-800 font-bold text-sm">
            {review.reviewerName || "Người dùng ẩn danh"}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-sm flex">{renderStars(review.overall)}</div>
            <span className="text-slate-500 text-xs font-medium">{review.reviewTime}</span>
          </div>
        </div>
        
        {review.verified && (
          <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            ✓ Đã mua hàng
          </span>
        )}
      </div>

      <h5 className="text-slate-800 font-bold mb-2 text-sm">{review.summary}</h5>
      <p className="text-slate-600 text-sm leading-relaxed">{review.reviewText}</p>

      {review.style && typeof review.style === 'object' && Object.keys(review.style).length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {Object.entries(review.style).map(([key, value]) => (
            <span key={key} className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              {String(key).replace(':', '')}: <span className="text-slate-800 font-medium">{String(value).trim()}</span>
            </span>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default ReviewItem;