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

  // 🌟 LOADING THEME MỚI
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl border border-sky-200 shadow-sm m-4 md:m-8">
      <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sky-700 font-bold animate-pulse">Đang nạp hệ thống phân tích sản phẩm mới...</p>
    </div>
  );

  if (error) return <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center font-bold shadow-sm m-4 md:m-8">⚠️ {error}</div>;

  // Lấy dữ liệu Case 7A
  const similarItems = data?.case7a_similar_or_replacement_product?.items || [];
  const filteredSimilarItems = similarItems.filter(item => 
    item.source_title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.similar_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm tính điểm (Dựa theo rules của CASE 7B)
  const handleCalculate = (e) => {
    e.preventDefault();
    const s1 = parseFloat(surveyForm.interestScore);
    const s2 = parseFloat(surveyForm.expertFitScore);
    const s3 = parseFloat(surveyForm.trendScore);
    const s4 = 6 - parseFloat(surveyForm.expertRiskScore); // Thang 5, đảo ngược rủi ro
    
    // Trung bình cộng chia 5 để lấy tỷ lệ %
    const finalScore = ((s1 + s2 + s3 + s4) / 4) / 5;
    setCalculatedScore(finalScore);
  };

  // 🌟 ĐÃ SỬA: Cập nhật màu sắc cho các trạng thái Quyết định
  const getDecisionAdvice = (score) => {
    if (score >= 0.75) return { text: "Ưu tiên nhập thử có kiểm soát", color: "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-sm" };
    if (score >= 0.55) return { text: "Cân nhắc nhập mẫu nhỏ / Khảo sát thêm", color: "text-amber-700 bg-amber-50 border-amber-200 shadow-sm" };
    return { text: "Chưa nên nhập, nguy cơ tồn kho cao", color: "text-rose-700 bg-rose-50 border-rose-200 shadow-sm" };
  };

  return (
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 sm:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white/95 backdrop-blur border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl text-2xl shadow-sm">🚀</span> Hỗ Trợ Ra Mắt Sản Phẩm Mới (Cold-Start)
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Công cụ giả lập AI và Đánh giá chuyên gia giúp giảm thiểu rủi ro khi nhập các dòng hàng chưa từng có lịch sử kinh doanh trên hệ thống.
            </p>
          </div>
        </div>

        {/* TABS CHUYỂN ĐỔI KỊCH BẢN */}
        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl border border-sky-200 shadow-sm w-max max-w-full">
          <button
            onClick={() => setActiveMode('similar')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
              activeMode === 'similar' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
            }`}
          >
            <span>🔍</span> Tìm Sản Phẩm Tương Tự
          </button>
          <button
            onClick={() => setActiveMode('new')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
              activeMode === 'new' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
            }`}
          >
            <span>📋</span> Chấm Điểm Hàng Mới Tinh
          </button>
        </div>

        {/* =========================================================
            KỊCH BẢN 1: TÌM HÀNG TƯƠNG TỰ (CASE 7A)
            ========================================================= */}
        {activeMode === 'similar' && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white p-4 rounded-3xl border border-sky-200 shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm cũ để tìm các sản phẩm mới có tính năng tương tự..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <span className="absolute right-4 top-3 opacity-40 text-lg">🔍</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-sky-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-sky-50/90 backdrop-blur text-sky-800 text-xs font-bold uppercase shadow-sm border-b border-sky-200 z-10 tracking-wider">
                    <tr>
                      <th className="p-4 w-1/2 border-r border-sky-100">Sản phẩm Gốc (Tham chiếu)</th>
                      <th className="p-4 w-1/2">Sản phẩm Thay thế / Tương tự</th>
                      <th className="p-4 text-center border-l border-sky-100 w-32">Độ Tương Đồng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 text-sm">
                    {filteredSimilarItems.length === 0 ? (
                       <tr>
                         <td colSpan="3" className="p-16 text-center text-slate-500 font-medium">Không tìm thấy sản phẩm tương tự nào khớp với từ khóa.</td>
                       </tr>
                    ) : (
                      filteredSimilarItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                          <td className="p-4 border-r border-sky-50">
                            <p className="font-bold text-slate-800 line-clamp-2">{item.source_title}</p>
                            <span className="text-[11px] text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md font-mono font-bold mt-1.5 inline-block shadow-sm">
                              ASIN: {item.source_asin}
                            </span>
                          </td>
                          <td className="p-4 bg-sky-50/20">
                            <p className="font-bold text-slate-800 line-clamp-2">{item.similar_title}</p>
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-mono font-bold mt-1.5 inline-block shadow-sm">
                              ASIN: {item.similar_asin}
                            </span>
                          </td>
                          <td className="p-4 text-center border-l border-sky-50 font-mono font-black text-amber-500 text-base bg-amber-50/10">
                            {(item.similarity_score * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))
                    )}
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
          <div className="animate-fadeIn grid lg:grid-cols-2 gap-6">
            
            {/* Form Nhập liệu Khảo sát */}
            <form onSubmit={handleCalculate} className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm space-y-5">
              <h2 className="text-xl font-black text-slate-800 border-b border-sky-100 pb-3 mb-5 flex items-center gap-2">
                <span className="bg-sky-50 p-1 rounded-md">📝</span> Thông số Khảo sát & Chuyên gia
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên sản phẩm dự kiến nhập</label>
                <input required type="text" value={surveyForm.name} onChange={e => setSurveyForm({...surveyForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium shadow-sm" placeholder="VD: Bàn phím cơ XYZ phân khúc giá rẻ..." />
              </div>

              <div className="grid grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Mức độ hứng thú (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.interestScore} onChange={e => setSurveyForm({...surveyForm, interestScore: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Độ phù hợp thị trường (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.expertFitScore} onChange={e => setSurveyForm({...surveyForm, expertFitScore: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Xu hướng bên ngoài (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.trendScore} onChange={e => setSurveyForm({...surveyForm, trendScore: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-600 mb-1.5 uppercase tracking-wide">Mức độ Rủi ro (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={surveyForm.expertRiskScore} onChange={e => setSurveyForm({...surveyForm, expertRiskScore: e.target.value})} className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-rose-700 font-mono font-black focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-sm" />
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl transition-all shadow-md shadow-sky-500/30 active:scale-95 flex justify-center items-center gap-2">
                <span className="text-xl">⚙️</span> Phân Tích Điểm Tiềm Năng
              </button>
            </form>

            {/* Bảng Kết quả Đánh giá */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden text-center min-h-[350px]">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-100 via-white to-white pointer-events-none"></div>
              
              {!calculatedScore ? (
                <div className="text-center z-10 text-slate-400">
                  <span className="text-6xl block mb-6 opacity-30">🔮</span>
                  <p className="font-medium max-w-xs mx-auto">Nhập các thông số dự đoán và nhấn <strong className="text-sky-600">"Phân Tích"</strong> để xem khuyến nghị từ hệ thống.</p>
                </div>
              ) : (
                <div className="text-center z-10 w-full animate-fadeIn">
                  <h3 className="text-xl font-black text-slate-800 mb-2">{surveyForm.name || "Sản phẩm mới"}</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium bg-slate-50 px-3 py-1 rounded-lg inline-block border border-slate-100">Điểm đánh giá tổng hợp (Cold-Start Score)</p>
                  
                  <div className="text-7xl font-black text-sky-600 mb-8 font-mono drop-shadow-sm">
                    {(calculatedScore * 100).toFixed(1)}<span className="text-4xl text-sky-400 ml-1">%</span>
                  </div>

                  <div className={`p-4 border-2 rounded-2xl mx-auto max-w-md ${getDecisionAdvice(calculatedScore).color}`}>
                    <p className="font-black text-lg">{getDecisionAdvice(calculatedScore).text}</p>
                    <p className="text-xs font-medium opacity-80 mt-1.5 uppercase tracking-wide">Dựa trên Decision Rule (CASE 7B)</p>
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