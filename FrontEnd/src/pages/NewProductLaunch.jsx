
import React, { useState, useEffect } from 'react';

const NewProductLaunch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quản lý kịch bản: 'similar' (Case 7A) hoặc 'new' (Case 7B)
  const [activeMode, setActiveMode] = useState('similar');
  const [searchTerm, setSearchTerm] = useState('');

  // State cho Form tính điểm sản phẩm mới hoàn toàn
  const [surveyForm, setSurveyForm] = useState({
    name: '',
    interestScore: 3,
    expertFitScore: 3,
    expertRiskScore: 3,
    trendScore: 3
  });
  const [calculatedScore, setCalculatedScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analytics/new-product');
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Lỗi tải dữ liệu');
        setData(resData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-xl">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-pink-400 font-bold animate-pulse">Đang nạp hệ thống phân tích sản phẩm mới...</p>
    </div>
  );

  if (error) return <div className="text-red-400 p-6 text-center m-4">⚠️ {error}</div>;

  // Lấy dữ liệu Case 7A
  const similarItems = data?.case7a_similar_or_replacement_product?.items || [];
  const filteredSimilarItems = similarItems.filter(item => 
    item.source_title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.similar_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm tính điểm (Dựa theo rules của CASE 7B)
  const handleCalculate = (e) => {
    e.preventDefault();
    // Công thức giả định chuẩn hóa về thang 1.0
    // Điểm rủi ro (Risk) bị đảo ngược (Rủi ro thấp = Điểm cao)
    const s1 = parseFloat(surveyForm.interestScore);
    const s2 = parseFloat(surveyForm.expertFitScore);
    const s3 = parseFloat(surveyForm.trendScore);
    const s4 = 6 - parseFloat(surveyForm.expertRiskScore); // Thang 5, đảo ngược rủi ro
    
    // Trung bình cộng chia 5 để lấy tỷ lệ %
    const finalScore = ((s1 + s2 + s3 + s4) / 4) / 5;
    setCalculatedScore(finalScore);
  };

  const getDecisionAdvice = (score) => {
    if (score >= 0.75) return { text: "Ưu tiên nhập thử có kiểm soát", color: "text-emerald-400 bg-emerald-900/40 border-emerald-500" };
    if (score >= 0.55) return { text: "Cân nhắc nhập mẫu nhỏ / Khảo sát thêm", color: "text-amber-400 bg-amber-900/40 border-amber-500" };
    return { text: "Chưa nên nhập, nguy cơ tồn kho cao", color: "text-rose-400 bg-rose-900/40 border-rose-500" };
  };

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-black text-pink-400 flex items-center gap-3">
            <span>🚀</span> Hỗ Trợ Ra Mắt Sản Phẩm Mới (Cold-Start)
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Công cụ giả lập AI và Đánh giá chuyên gia giúp giảm thiểu rủi ro khi nhập các dòng hàng chưa từng có lịch sử kinh doanh trên hệ thống.
          </p>
        </div>

        {/* TABS CHUYỂN ĐỔI KỊCH BẢN */}
        <div className="flex gap-4 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveMode('similar')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeMode === 'similar' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🔍 Tìm Sản Phẩm Tương Tự
          </button>
          <button
            onClick={() => setActiveMode('new')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeMode === 'new' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            📋 Chấm Điểm Hàng Mới Tinh
          </button>
        </div>

        {/* =========================================================
            KỊCH BẢN 1: TÌM HÀNG TƯƠNG TỰ (CASE 7A)
            ========================================================= */}
        {activeMode === 'similar' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm cũ để tìm các sản phẩm mới có tính năng tương tự..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-900 text-slate-400 text-xs font-bold uppercase shadow-md">
                    <tr>
                      <th className="p-4 w-1/2">Sản phẩm Gốc (Tham chiếu)</th>
                      <th className="p-4 w-1/2 border-l border-slate-700">Sản phẩm Thay thế / Tương tự</th>
                      <th className="p-4 text-center border-l border-slate-700">Độ Tương Đồng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm">
                    {filteredSimilarItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-200 line-clamp-2">{item.source_title}</p>
                          <span className="text-xs text-pink-400 bg-pink-900/20 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                            {item.source_asin}
                          </span>
                        </td>
                        <td className="p-4 border-l border-slate-700 bg-slate-800/50">
                          <p className="font-bold text-slate-300 line-clamp-2">{item.similar_title}</p>
                          <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                            {item.similar_asin}
                          </span>
                        </td>
                        <td className="p-4 text-center border-l border-slate-700 font-mono font-bold text-amber-400">
                          {(item.similarity_score * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            KỊCH BẢN 2: CHẤM ĐIỂM HÀNG MỚI (CASE 7B)
            ========================================================= */}
        {activeMode === 'new' && (
          <div className="animate-fade-in grid md:grid-cols-2 gap-6">
            
            {/* Form Nhập liệu Khảo sát */}
            <form onSubmit={handleCalculate} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2 mb-4">📝 Nhập dữ liệu Khảo sát & Chuyên gia</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Tên sản phẩm dự kiến nhập</label>
                <input required type="text" value={surveyForm.name} onChange={e => setSurveyForm({...surveyForm, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500" placeholder="VD: Bàn phím cơ XYZ" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Mức độ hứng thú (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.interestScore} onChange={e => setSurveyForm({...surveyForm, interestScore: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Độ phù hợp thị trường (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.expertFitScore} onChange={e => setSurveyForm({...surveyForm, expertFitScore: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Xu hướng bên ngoài (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.trendScore} onChange={e => setSurveyForm({...surveyForm, trendScore: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-rose-400 mb-1">Mức độ Rủi ro (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.expertRiskScore} onChange={e => setSurveyForm({...surveyForm, expertRiskScore: e.target.value})} className="w-full bg-slate-900 border border-rose-900 rounded-lg px-4 py-2 text-white font-mono focus:border-rose-500" />
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                🔄 Phân Tích Điểm Tiềm Năng
              </button>
            </form>

            {/* Bảng Kết quả Đánh giá */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>
              
              {!calculatedScore ? (
                <div className="text-center z-10 text-slate-500">
                  <span className="text-5xl block mb-4">🔮</span>
                  <p>Nhập thông số và nhấn "Phân Tích" để xem khuyến nghị từ hệ thống.</p>
                </div>
              ) : (
                <div className="text-center z-10 w-full animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-300 mb-2">{surveyForm.name || "Sản phẩm mới"}</h3>
                  <p className="text-sm text-slate-400 mb-6">Điểm đánh giá tổng hợp (Cold-Start Score)</p>
                  
                  <div className="text-6xl font-black text-white mb-8 font-mono drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    {(calculatedScore * 100).toFixed(1)}%
                  </div>

                  <div className={`p-4 border-2 rounded-xl ${getDecisionAdvice(calculatedScore).color}`}>
                    <p className="font-bold text-lg">{getDecisionAdvice(calculatedScore).text}</p>
                    <p className="text-xs opacity-80 mt-1">Dựa trên Decision Rule (CASE 7B)</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default NewProductLaunch;