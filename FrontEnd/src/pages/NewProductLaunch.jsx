import React, { useState, useEffect } from 'react';

const NewProductLaunch = () => {
  const [formData, setFormData] = useState({
    title: '', brand: '', category: '', description: '', price: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [surveyProducts, setSurveyProducts] = useState([]);

  // Lấy các sản phẩm đang trong trạng thái khảo sát
  const fetchSurveyProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/products/my-products', { // Thay bằng endpoint getMyProducts của bạn
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Lọc ra những sản phẩm đang khảo sát
        setSurveyProducts(data.filter(p => p.status === 'Đang khảo sát'));
      }
    } catch (error) { console.error("Lỗi lấy sản phẩm khảo sát:", error); }
  };

  useEffect(() => {
    fetchSurveyProducts();
  }, []);

  const handleLaunch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Gọi API chạy AI và gửi email (đã tạo ở Phần 2)
      const res = await fetch('http://localhost:5000/api/products/launch-survey', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        fetchSurveyProducts(); // Cập nhật lại bảng
        setFormData({ title: '', brand: '', category: '', description: '', price: '' });
      } else {
        alert("❌ Lỗi: " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* KHU VỰC 1: FORM TẠO SẢN PHẨM KHẢO SÁT */}
      <div className="bg-white p-8 rounded-3xl border border-indigo-200 shadow-sm flex flex-col md:flex-row gap-8">
        
        {/* Form Nhập liệu */}
        <div className="flex-1">
          <h2 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🚀</span> Khởi tạo chiến dịch Launch (Cold-Start)
          </h2>
          <form onSubmit={handleLaunch} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tên sản phẩm mới</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" placeholder="Ví dụ: Tai nghe Bluetooth XYZ..." />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Thương hiệu</label>
                <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Danh mục</label>
                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Giá dự kiến ($)</label>
              <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả đặc điểm</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 h-24" placeholder="Nhập các keyword tính năng để AI phân tích..."></textarea>
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? 'Đang chạy mô hình AI...' : 'Phân tích & Phát hành Khảo sát'}
            </button>
          </form>
        </div>

        {/* Kết quả AI trả về */}
        <div className="flex-1 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="text-lg font-bold text-indigo-800 mb-4">Kết luận từ AI Model</h3>
          {aiResult ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
                <p className="text-sm text-slate-500 font-bold mb-1">Điểm tự tin (Similarity Score)</p>
                <div className="text-3xl font-black text-indigo-600">
                  {(aiResult.ai_summary.confidence_score * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
                <p className="text-sm text-slate-500 font-bold mb-1">Lời khuyên hệ thống</p>
                <p className="text-md font-bold text-slate-800">{aiResult.ai_summary.advice}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-700 font-bold flex items-center gap-2">
                <span>📧</span> Đã gửi tự động Email khảo sát cho {aiResult.usersMailed} khách hàng có nhu cầu tiềm năng!
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-indigo-300 text-center">
              <span className="text-6xl mb-4 opacity-50">🤖</span>
              <p className="font-medium">Nhập thông tin sản phẩm để<br/>mô hình Cold-Start phân tích</p>
            </div>
          )}
        </div>
      </div>

      {/* KHU VỰC 2: BẢNG TỔNG KẾT KHẢO SÁT */}
      <div className="bg-white p-8 rounded-3xl border border-sky-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span> Bảng Theo Dõi Khảo Sát
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-bold rounded-tl-xl">Tên Sản Phẩm</th>
                <th className="p-4 font-bold">Ngày tạo</th>
                <th className="p-4 font-bold text-center">Lượt phản hồi</th>
                <th className="p-4 font-bold text-center">Tỷ lệ muốn mua</th>
                <th className="p-4 font-bold rounded-tr-xl">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {surveyProducts.map(prod => {
                const total = prod.surveyStats?.totalResponses || 0;
                const positive = prod.surveyStats?.positiveResponses || 0;
                const percent = total > 0 ? ((positive / total) * 100).toFixed(1) : 0;

                return (
                  <tr key={prod._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 max-w-xs truncate">{prod.title}</td>
                    <td className="p-4 text-sm text-slate-500">{(new Date(prod.createdAt || Date.now())).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4 text-center font-bold text-sky-600">{total}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${percent >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {percent}%
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-sm font-bold bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        Đăng bán chính thức
                      </button>
                    </td>
                  </tr>
                );
              })}
              {surveyProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Chưa có sản phẩm nào đang trong quá trình khảo sát.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default NewProductLaunch;