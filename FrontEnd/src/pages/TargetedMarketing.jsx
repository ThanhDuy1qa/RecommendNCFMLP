import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import EmailModal from '../components/EmailModal';
const TargetedMarketing = () => {
  const [marketingData, setMarketingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation(); 

  // ==========================================
  // STATE: QUẢN LÝ TÍNH NĂNG GỬI GMAIL
  // ==========================================
  const [emailModal, setEmailModal] = useState({ isOpen: false, to: '', subject: '', htmlBody: '', isBulk: false });
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // API Fetch...
  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Từ chối truy cập! Bạn chưa đăng nhập.");

        const response = await fetch('http://localhost:5000/api/analytics/marketing-targets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi tải dữ liệu marketing');
        
        setMarketingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketingData();
  }, []);

  useEffect(() => {
    if (marketingData && location.state?.autoSelectAsin) {
      const targetAsin = location.state.autoSelectAsin;
      const targetProducts = marketingData.best_marketing_targets || [];
      const autoProd = targetProducts.find(p => p.asin === targetAsin || String(p.item_id) === String(targetAsin));
      if (autoProd) {
        setSelectedProduct(autoProd);
        window.history.replaceState({}, document.title);
      }
    }
  }, [marketingData, location.state]);

  const targetProducts = marketingData?.best_marketing_targets || [];
  const userDetails = marketingData?.user_product_detail || [];

  const filteredProducts = targetProducts.filter(prod => 
    prod.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prod.asin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTargetUsers = (asin) => {
    return userDetails.filter(user => user.asin === asin).sort((a, b) => b.hybrid_score - a.hybrid_score);
  };

  // ==========================================
  // HÀM: XUẤT FILE CSV
  // ==========================================
  const handleExportCSV = () => {
    if (!selectedProduct) return;
    const users = getTargetUsers(selectedProduct.asin);
    if (users.length === 0) return alert("Chưa có dữ liệu khách hàng để xuất!");

    const headers = ['STT', 'Mã_Khách_Hàng', 'Email_Address', 'Hybrid_Score', 'Rank'];
    const csvRows = users.map((user, index) => {
      const userEmail = user.email || `user${user.user_id}@datn.com`; 
      const userName = user.name || `Khách hàng #${user.user_id}`;

      return [
        index + 1, 
        userName, 
        userEmail,
        user.hybrid_score ? user.hybrid_score.toFixed(6) : 'N/A', 
        user.rank || 'N/A'
      ].join(','); 
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Marketing_Targets_${selectedProduct.asin}.csv`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // HÀM: MỞ CỬA SỔ GỬI CHO 1 NGƯỜI
  // ==========================================
  const openSingleEmailModal = (userEmail, userName) => {
    setEmailModal({
      isOpen: true,
      to: userEmail,
      isBulk: false,
      subject: `[Kho Điện Tử] Ưu đãi đặc biệt dành riêng cho bạn 🚀`,
      htmlBody: `<h3>Xin chào ${userName}!</h3>\n<p>Hệ thống AI của chúng tôi nhận thấy bạn có quan tâm đặc biệt đến các sản phẩm công nghệ.</p>\n<p>Sản phẩm <b>"${selectedProduct.title}"</b> hiện đang có ưu đãi rất tốt và cực kỳ phù hợp với nhu cầu của bạn.</p>\n<p>Đừng bỏ lỡ cơ hội, hãy truy cập hệ thống ngay để xem chi tiết nhé!</p>\n<br/>\n<p>Trân trọng,<br/><b>Đội ngũ Kho Điện Tử</b></p>`
    });
  };

  // ==========================================
  // HÀM: MỞ CỬA SỔ GỬI HÀNG LOẠT (TẤT CẢ USER)
  // ==========================================
  const openBulkEmailModal = () => {
    const users = getTargetUsers(selectedProduct.asin);
    const allEmails = users.map(user => user.email || `user${user.user_id}@datn.com`);

    setEmailModal({
      isOpen: true,
      to: allEmails, 
      isBulk: true,
      subject: `[Kho Điện Tử] Gợi ý mua sắm thông minh tuần này 🌟`,
      htmlBody: `<h3>Xin chào các Khách hàng thân thiết!</h3>\n<p>Dựa trên thói quen mua sắm, chúng tôi gợi ý sản phẩm <b>"${selectedProduct.title}"</b> dành riêng cho bạn.</p>\n<p>Sản phẩm đang nằm trong top bán chạy và được đánh giá rất cao trên hệ thống.</p>\n<br/>\n<p>Trân trọng,<br/><b>Hệ thống AI - Kho Điện Tử</b></p>`
    });
  };

  // ==========================================
  // HÀM: GỌI API BACKEND GỬI QUA MAILTRAP
  // ==========================================
  const handleRealSend = async () => {
    setIsSending(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/send-marketing-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emailModal.to,
          subject: emailModal.subject,
          html: emailModal.htmlBody
        })
      });

      if (!response.ok) {
        throw new Error("Lỗi khi kết nối với máy chủ gửi mail.");
      }

      setIsSending(false);
      setEmailModal({ ...emailModal, isOpen: false }); 
      setToastMessage(`Chiến dịch đã được gửi thành công!`); 
      
      setTimeout(() => setToastMessage(null), 4000);
    } catch (error) {
      console.error(error);
      setIsSending(false);
      alert("Lỗi: Không thể gửi email. Hãy kiểm tra Backend!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl border border-sky-200 shadow-sm m-4 md:m-8">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sky-700 font-bold animate-pulse">Đang trích xuất tệp khách hàng tiềm năng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center font-bold shadow-sm m-4 md:m-8">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 sm:p-8 text-slate-800 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white/95 backdrop-blur border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl text-2xl shadow-sm">🎯</span> Chiến dịch Marketing Mục tiêu
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Xác định tệp khách hàng có xác suất mua cao nhất cho từng sản phẩm để tối ưu chi phí quảng cáo và gửi Mail tự động.
            </p>
          </div>
        </div>

        {/* PHẦN 1: DANH SÁCH SẢN PHẨM */}
        {!selectedProduct && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex bg-white p-4 rounded-3xl border border-sky-200 shadow-sm">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh sản phẩm cần chạy quảng cáo theo Mã ASIN hoặc Tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
                />
                <span className="absolute right-4 top-3 opacity-40 text-lg">🔍</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-sky-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-sky-50/80 text-sky-800 text-xs font-bold uppercase border-b border-sky-200 tracking-wider">
                      <th className="p-4 w-24 text-center">Ảnh</th>
                      <th className="p-4">Thông tin Sản phẩm</th>
                      <th className="p-4 w-32 text-center border-l border-sky-100">Khách Hàng<br/>Mục Tiêu</th>
                      <th className="p-4 w-36 text-center border-l border-sky-100">Điểm Tiềm Năng<br/>(Hybrid Score)</th>
                      <th className="p-4 w-40 text-center border-l border-sky-100">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 text-sm">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-16 text-center text-slate-500 font-medium">
                          Chưa có tệp khách hàng tiềm năng nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod, idx) => (
                        <tr key={prod.asin || idx} className="hover:bg-sky-50/40 transition-colors">
                          <td className="p-4">
                            <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-200 shadow-sm mx-auto overflow-hidden">
                              <img src={prod.image_url || 'https://via.placeholder.com/50'} alt="" className="max-h-full max-w-full object-contain" />
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800 line-clamp-2" title={prod.title}>{prod.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-mono text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{prod.asin}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center border-l border-sky-50">
                            <span className="font-black text-2xl text-sky-600">{prod.target_user_count || prod.predicted_user_count || 0}</span>
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-amber-500 border-l border-sky-50 bg-sky-50/20">
                            {prod.avg_hybrid_score ? prod.avg_hybrid_score.toFixed(5) : 'N/A'}
                          </td>
                          <td className="p-4 text-center border-l border-sky-50">
                            <button 
                              onClick={() => setSelectedProduct(prod)}
                              className="bg-white border border-sky-200 text-sky-700 hover:bg-sky-600 hover:border-sky-600 hover:text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm text-xs flex items-center justify-center gap-1.5 w-full active:scale-95"
                            >
                              <span>👁️</span> Xem Tệp
                            </button>
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

        {/* PHẦN 2: CHI TIẾT TỆP KHÁCH HÀNG & EMAIL */}
        {selectedProduct && (
          <div className="animate-fadeIn space-y-6">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-sky-700 hover:bg-sky-100 transition-colors font-bold bg-white px-5 py-2.5 rounded-xl w-max border border-sky-200 shadow-sm active:scale-95"
            >
              <span>&larr;</span> Quay lại danh sách sản phẩm
            </button>

            <div className="bg-white p-6 rounded-3xl border border-sky-200 flex items-center gap-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
              <div className="w-24 h-24 bg-white rounded-2xl p-2 flex-shrink-0 border border-slate-200 shadow-sm z-10 flex items-center justify-center">
                <img src={selectedProduct.image_url || 'https://via.placeholder.com/150'} className="max-w-full max-h-full object-contain" alt="" />
              </div>
              <div className="z-10">
                <h2 className="text-xl font-black text-slate-800 mb-3 line-clamp-2">{selectedProduct.title || 'Sản phẩm mục tiêu'}</h2>
                <div className="flex gap-3 text-xs font-bold font-mono">
                  <span className="text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg shadow-sm">Mã: {selectedProduct.asin}</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-sm">Tệp: {selectedProduct.target_user_count || 0} Users</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-sky-200 overflow-hidden shadow-sm">
              <div className="bg-sky-50 p-5 border-b border-sky-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-black text-sky-800 flex items-center gap-2">
                  <span className="bg-white p-1 rounded-md shadow-sm">👥</span> Danh sách Khách hàng
                </h3>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={openBulkEmailModal}
                    className="text-xs bg-amber-500 hover:bg-amber-400 px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-md shadow-amber-500/30 active:scale-95 flex items-center gap-2"
                  >
                    <span>🚀</span> Gửi Email Hàng Loạt
                  </button>

                  <button 
                    onClick={handleExportCSV}
                    className="text-xs bg-sky-600 hover:bg-sky-500 px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-md shadow-sky-500/30 active:scale-95 flex items-center gap-2"
                  >
                    <span>📥</span> Xuất CSV
                  </button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
                  <thead className="sticky top-0 bg-white text-slate-500 text-xs font-bold uppercase shadow-sm border-b border-sky-100 z-10">
                    <tr>
                      {/* Cho cột số thứ tự nhỏ nhất */}
                      <th className="p-4 w-[8%] text-center">#</th>
                      
                      {/* Chia đều không gian cho Mã KH và Email */}
                      <th className="p-4 border-l border-slate-100 w-[27%]">Mã Khách Hàng</th>
                      <th className="p-4 border-l border-slate-100 w-[35%] truncate">Địa chỉ Email</th>
                      
                      {/* Cột Điểm và Thao tác cần vừa đủ chỗ cho nội dung */}
                      <th className="p-4 text-center border-l border-slate-100 w-[15%]">Hybrid Score</th>
                      <th className="p-4 text-center border-l border-slate-100 w-[15%]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50 text-sm">
                    {getTargetUsers(selectedProduct.asin).length === 0 ? (
                      <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-medium">Chưa có dữ liệu.</td></tr>
                    ) : (
                      getTargetUsers(selectedProduct.asin).map((user, idx) => {
                        const userEmail = user.email || `user${user.user_id}@datn.com`;
                        const userName = user.name || `Khách hàng #${user.user_id}`;

                        return (
                          <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                            <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-4 font-mono font-bold text-slate-600 border-l border-sky-50">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 p-1 rounded-full text-xs">👤</span> 
                                {userName}
                              </div>
                            </td>
                            <td className="p-4 font-medium text-sky-700 border-l border-sky-50">
                              {userEmail}
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-amber-500 border-l border-sky-50">
                              {user.hybrid_score ? user.hybrid_score.toFixed(6) : 'N/A'}
                            </td>
                            <td className="p-4 text-center border-l border-sky-50">
                              <button 
                                onClick={() => openSingleEmailModal(userEmail, userName)}
                                className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm w-full active:scale-95"
                              >
                                <span>📧</span> Gửi 1 Mail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================
          CỬA SỔ (MODAL) XÁC NHẬN VÀ CHỈNH SỬA GỬI MAIL
          ========================================================= */}
      <EmailModal 
        emailModal={emailModal} 
        setEmailModal={setEmailModal} 
        isSending={isSending} 
        onSend={handleRealSend} 
      />
      {/* TOAST THÔNG BÁO GÓC MÀN HÌNH */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50 animate-bounce">
          <span className="bg-white text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">✓</span> 
          {toastMessage}
        </div>
      )}

    </div>
  );
};

export default TargetedMarketing;