import React from 'react';
import { useAiOverview } from '../hooks/useAiOverview';

const AiOverviewDashboard = () => {
  const { dashboardData, topScenario, loading, error } = useAiOverview();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-xl">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-400 font-bold animate-pulse">Đang nạp dữ liệu Trung tâm điều khiển AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 text-red-400 p-6 rounded-xl text-center m-4 font-bold">
        ⚠️ {error}
      </div>
    );
  }

  // =========================================================================
  // ĐÃ SỬA CHỮA: TRÍCH XUẤT DỮ LIỆU TỪ MẢNG ABLATION_SUMMARY (Cực kỳ chính xác)
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
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Tiêu đề trang */}
        <div className="border-b border-slate-700 pb-4 mb-8">
          <h1 className="text-3xl font-black text-blue-400 flex items-center gap-3">
            <span>⚙️</span> Trung tâm Điều khiển Thuật toán (AI Dashboard)
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Theo dõi quy mô dữ liệu, đánh giá hiệu năng mô hình và kịch bản kinh doanh hiện tại.
          </p>
        </div>

        {/* Khối 1: Quy mô Tập dữ liệu */}
        {/* Khối 1: Quy mô Tập dữ liệu */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
            <span>📊</span> Thông số Tập dữ liệu (Dataset)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Users</p>
              {/* ĐÃ SỬA: final_report.dataset.num_users */}
              <p className="text-2xl font-black text-blue-400">{dashboardData?.final_report?.dataset?.num_users?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Items</p>
              {/* ĐÃ SỬA: final_report.dataset.num_items */}
              <p className="text-2xl font-black text-purple-400">{dashboardData?.final_report?.dataset?.num_items?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Train Interactions</p>
              {/* ĐÃ SỬA: final_report.dataset.train_interactions */}
              <p className="text-2xl font-black text-green-400">{dashboardData?.final_report?.dataset?.train_interactions?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Test Interactions</p>
              {/* ĐÃ SỬA: final_report.dataset.test_interactions */}
              <p className="text-2xl font-black text-orange-400">{dashboardData?.final_report?.dataset?.test_interactions?.toLocaleString() || "0"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Khối 2: Kết quả Mô hình */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.1)] p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <span>🧠</span> Đánh giá Mô hình (Model Performance)
            </h2>
            
            <div className="mb-6 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 flex justify-between items-center">
              <span className="text-indigo-300 font-semibold">Thuật toán lõi (Core Method):</span>
              <span className="text-indigo-400 font-black font-mono text-lg">{bestModelName}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
                <p className="text-slate-400 text-xs font-bold mb-1">Recall (R@20)</p>
                <p className="text-xl font-bold text-white">{bestModelMetrics["R@20"]}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <p className="text-slate-400 text-xs font-bold mb-1 mt-1">Hit Ratio (HR@20)</p>
                <p className="text-xl font-bold text-green-400">{bestModelMetrics["HR@20"]}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
                <p className="text-slate-400 text-xs font-bold mb-1">NDCG (N@20)</p>
                <p className="text-xl font-bold text-white">{bestModelMetrics["N@20"]}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <p className="text-slate-400 text-xs font-bold mb-1 mt-1">Model Score</p>
                <p className="text-xl font-bold text-blue-400">{bestModelMetrics["Score"]}</p>
              </div>
            </div>
          </div>

          {/* Khối 3: Kịch bản nghiệp vụ */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <span>💼</span> Kịch bản Phân Phối Gợi Ý
            </h2>
            <div className="flex-1 flex flex-col justify-center items-center bg-slate-900/50 rounded-xl border border-slate-700 p-4 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Scenario Top 1 hiện hành:</p>
              <p className="text-lg font-black text-emerald-400 font-mono break-all mb-4">
                {businessScenario}
              </p>
              
              <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg w-full flex justify-between items-center shadow-inner">
                <span className="text-xs font-bold text-slate-400">Điểm kịch bản:</span>
                <span className="text-lg font-black text-blue-400">{scenarioScore}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AiOverviewDashboard;