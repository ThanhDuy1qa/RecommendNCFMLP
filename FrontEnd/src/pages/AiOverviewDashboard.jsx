import React from 'react';
import { useAiOverview } from '../hooks/useAiOverview';

const AiOverviewDashboard = () => {
  const { dashboardData, topScenario, loading, error } = useAiOverview();

  // GIỮ NGUYÊN HOÀN TOÀN TRẠNG THÁI LOADING THEME MỚI
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl border border-sky-200 shadow-sm">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sky-700 font-black animate-pulse">Đang nạp dữ liệu Trung tâm điều khiển AI...</p>
      </div>
    );
  }

  // GIỮ NGUYÊN HOÀN TOÀN TRẠNG THÁI BÁO LỖI
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center m-4 font-bold shadow-sm">
        ⚠️ {error}
      </div>
    );
  }

  // =========================================================================
  // LOGIC ĐƯỢC GIỮ NGUYÊN TUYỆT ĐỐI (Cực kỳ chính xác)
  // =========================================================================
  let bestModelName = "Đang phân tích...";
  let bestModelMetrics = { "R@20": "0.0000", "HR@20": "0.0000", "N@20": "0.0000", "Score": "0.0000" };

  if (dashboardData?.ablation_summary) {
    // Lọc lấy danh sách các mô hình trên tập Test
    const testModels = dashboardData.ablation_summary.filter(m => m.split === 'test');
    
    // Sắp xếp điểm Score từ cao xuống thấp và lấy mô hình Top 1 (vị trí 0)
    const bestModel = testModels.sort((a, b) => b.score - a.score)[0];
    
    if (bestModel) {
      bestModelName = bestModel.method; // Lấy tên thuật toán
      bestModelMetrics = {
        "R@20": bestModel["R@20"] ? bestModel["R@20"].toFixed(4) : "0.0000",
        "HR@20": bestModel["HR@20"] ? bestModel["HR@20"].toFixed(4) : "0.0000",
        "N@20": bestModel["N@20"] ? bestModel["N@20"].toFixed(4) : "0.0000",
        "Score": bestModel.score ? bestModel.score.toFixed(4) : "0.0000"
      };
    }
  }
  
  // Lấy dữ liệu động từ MongoDB cho Kịch bản kinh doanh
  const businessScenario = topScenario?.scenario || "Chưa có dữ liệu";
  const scenarioScore = topScenario?.final_user_based_score ? topScenario.final_user_based_score.toFixed(4) : "0.0000";

  return (
    // 🌟 ĐÃ SỬA: Đổi màu nền background sang dải màu gradient Sky cao cấp
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 sm:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TIÊU ĐỀ TRANG BIẾN ĐỔI SANG SKY THEME */}
        <div className="bg-white/95 backdrop-blur border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl shadow-sm text-2xl">⚙️</span> Trung tâm Điều khiển Thuật toán (AI)
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Theo dõi quy mô dữ liệu hệ thống, đánh giá hiệu năng các mô hình học máy và kịch bản kinh doanh hiện tại.
            </p>
          </div>
          <div className="bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm shrink-0">
            Trạng thái Hệ thống: 🟢 Sẵn sàng
          </div>
        </div>

        {/* KHỐI 1: QUY MÔ TẬP DỮ LIỆU ĐƯỢC THIẾT KẾ LẠI */}
        <div className="bg-white rounded-3xl border border-sky-200 shadow-sm p-6 transition-all hover:shadow-md">
          <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-sky-100 pb-3">
            <span className="bg-sky-50 p-1 rounded-lg">📊</span> Thông số dữ liệu cốt lõi (Dataset Details)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors">
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Tổng Số Người Dùng</p>
              <p className="text-2xl font-black text-blue-600">{dashboardData?.final_report?.dataset?.num_users?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors">
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Tổng Số Sản Phẩm</p>
              <p className="text-2xl font-black text-purple-600">{dashboardData?.final_report?.dataset?.num_items?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors">
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Tương Tác Huấn Luyện</p>
              <p className="text-2xl font-black text-emerald-600">{dashboardData?.final_report?.dataset?.train_interactions?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors">
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Tương Tác Kiểm Thử</p>
              <p className="text-2xl font-black text-amber-600">{dashboardData?.final_report?.dataset?.test_interactions?.toLocaleString() || "0"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KHỐI 2: KẾT QUẢ HIỆU NĂNG MÔ HÌNH */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-sky-200 shadow-sm p-6 transition-all hover:shadow-md">
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-sky-100 pb-3">
              <span className="bg-sky-50 p-1 rounded-lg">🧠</span> Đánh giá hiệu năng AI (Model Performance)
            </h2>
            
            <div className="mb-6 bg-sky-50/80 p-4 rounded-2xl border border-sky-100 flex justify-between items-center shadow-sm">
              <span className="text-sky-800 font-bold text-sm">Thuật toán tối ưu lõi (Core Method):</span>
              <span className="text-white bg-sky-600 font-black font-mono text-sm px-4 py-1.5 rounded-xl shadow-sm">
                {bestModelName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <p className="text-slate-400 text-xs font-bold mb-1.5 mt-1">Recall (R@20)</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{bestModelMetrics["R@20"]}</p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <p className="text-slate-400 text-xs font-bold mb-1.5 mt-1">Hit Ratio (HR@20)</p>
                <p className="text-2xl font-black text-emerald-600 tracking-tight">{bestModelMetrics["HR@20"]}</p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                <p className="text-slate-400 text-xs font-bold mb-1.5 mt-1">NDCG (N@20)</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{bestModelMetrics["N@20"]}</p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-500"></div>
                <p className="text-slate-400 text-xs font-bold mb-1.5 mt-1">Model Score</p>
                <p className="text-2xl font-black text-sky-600 tracking-tight">{bestModelMetrics["Score"]}</p>
              </div>
            </div>
          </div>

          {/* KHỐI 3: KỊCH BẢN NGHIỆP VỤ */}
          <div className="bg-white rounded-3xl border border-sky-200 shadow-sm p-6 flex flex-col transition-all hover:shadow-md">
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-sky-100 pb-3">
              <span className="bg-sky-50 p-1 rounded-lg">💼</span> Kịch bản Phân Phối Gợi Ý
            </h2>
            <div className="flex-1 flex flex-col justify-center items-center bg-slate-50/60 rounded-2xl border border-slate-100 p-5 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl border border-amber-200 flex items-center justify-center mb-4 shadow-sm animate-pulse">
                <span className="text-3xl">🏆</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Scenario Top 1 hiện hành:</p>
              
              <p className="text-base font-black text-sky-800 font-mono break-all mb-5 bg-white px-4 py-2.5 rounded-xl border border-sky-100 shadow-sm w-full">
                {businessScenario}
              </p>
              
              <div className="bg-white border border-sky-200 px-4 py-3 rounded-xl w-full flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-slate-500">Điểm kịch bản:</span>
                <span className="text-xl font-black text-sky-600 font-mono">{scenarioScore}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AiOverviewDashboard;