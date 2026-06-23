import React, { useState, useEffect } from 'react';
import { useFinanceAdmin } from '../hooks/useFinanceAdmin';

// 🌟 ĐÂY LÀ CHỖ BẠN BỊ THIẾU Ở CODE CŨ: Phải khai báo Component
const FinanceManagement = () => {
  // Toàn bộ logic Hook phải nằm TRONG component
  const { 
    payoutRequests, exceptionOrders, loading, stats, 
    handleApprovePayout, handleRejectPayout, handleResolveException,
    refreshData, 
    loadMoreRevenue, loadingMore // 🌟 THÊM 2 BIẾN NÀY VÀO ĐÂY
  } = useFinanceAdmin();
  
  const [activeTab, setActiveTab] = useState('revenue'); 
  
  const [viewQR, setViewQR] = useState({ isOpen: false, url: '', amountVND: 0, message: '', targetId: null, type: null });
  const EXCHANGE_RATE = 25000; 

  useEffect(() => {
    let interval;
    if (viewQR.isOpen) {
      interval = setInterval(() => { refreshData(); }, 3000); 
    }
    return () => clearInterval(interval);
  }, [viewQR.isOpen, refreshData]); 

  useEffect(() => {
    if (viewQR.isOpen && viewQR.targetId) {
      let stillExists = true;
      
      if (viewQR.type === 'payout') {
        stillExists = payoutRequests.some(p => p._id === viewQR.targetId);
      }

      if (!stillExists) {
        setViewQR({ isOpen: false, url: '', amountVND: 0, message: '', targetId: null, type: null });
        setTimeout(() => { alert('🎉 Tinh tinh! Hệ thống đã nhận được lệnh chuyển tiền và tự động gạch nợ thành công!'); }, 300);
      }
    }
  }, [payoutRequests, viewQR.isOpen, viewQR.targetId, viewQR.type]);

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <span className="text-4xl">🏦</span> Quản Lý Tài Chính & Đối Soát
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Trung tâm kiểm soát dòng tiền, xử lý ngoại lệ và thanh toán đối tác.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm border-l-4 border-l-sky-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Tổng Doanh Thu Cổng</p>
          <p className="text-2xl font-black text-sky-700 mt-1">
            {stats?.totalRevenue ? Math.round(stats.totalRevenue * EXCHANGE_RATE).toLocaleString('vi-VN') : '0'} đ
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm border-l-4 border-l-emerald-500 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Lợi Nhuận Nền Tảng (5%)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {stats?.platformProfit ? Math.round(stats.platformProfit * EXCHANGE_RATE).toLocaleString('vi-VN') : '0'} đ
            </p>
          </div>
          <div className="text-3xl opacity-20">💰</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Yêu Cầu Rút Tiền (Từ Seller)</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{payoutRequests?.length || 0} Lệnh chờ duyệt</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
        {[
          { id: 'revenue', icon: '📈', label: 'Chi Tiết Doanh Thu' },
          { id: 'payouts', icon: '🏧', label: 'Yêu Cầu Rút Tiền' },
          { id: 'exceptions', icon: '⚠️', label: 'Giao Dịch Lỗi (Thừa/Thiếu)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-sky-600 text-sky-700 bg-sky-50 rounded-t-xl' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl'
            }`}
          >
            <span className="mr-2">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'revenue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-emerald-700">📈 Phân Tích Lợi Nhuận Gần Đây</h2>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              Từ các đơn hàng Đã Hoàn Thành
            </span>
          </div>

          {loading && (!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Đang tải dữ liệu doanh thu...</div>
          ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4 opacity-50">🛒</span>
              <p className="text-slate-500 font-bold">Chưa có đơn hàng nào hoàn thành để tính lợi nhuận.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b font-bold">Mã Đơn / Khách Mua</th>
                    <th className="p-4 border-b font-bold">Thời Gian Hoàn Thành</th>
                    <th className="p-4 border-b font-bold text-right">Tổng Tiền Thu (VNĐ)</th>
                    <th className="p-4 border-b font-bold text-right text-emerald-600">Lợi Nhuận Hệ Thống (+5%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders.map((order) => {
                    const totalVND = Math.round(order.totalAmount * EXCHANGE_RATE);
                    const profitVND = Math.round(order.totalAmount * 0.05 * EXCHANGE_RATE);

                    return (
                      <tr key={order._id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-sm font-bold text-sky-700">
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">👤 {order.userId?.email || 'Khách Vãng Lai'}</div>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">
                          {new Date(order.updatedAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-bold text-slate-700">{totalVND.toLocaleString('vi-VN')} đ</div>
                        </td>
                        <td className="p-4 text-right bg-emerald-50/30">
                          <div className="font-black text-emerald-600 text-lg">
                            +{profitVND.toLocaleString('vi-VN')} đ
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* 🌟 THÊM NÚT "XEM THÊM" Ở ĐÂY */}
              {stats.hasMore && (
                <div className="p-6 text-center border-t border-slate-100 bg-slate-50/50">
                  <button 
                    onClick={loadMoreRevenue}
                    disabled={loadingMore}
                    className="bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 font-bold py-2.5 px-8 rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        Đang tải...
                      </>
                    ) : (
                      'Hiển thị thêm'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-amber-700">🏧 Danh Sách Yêu Cầu Rút Tiền Từ Ví</h2>
          </div>

          {loading && payoutRequests?.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Đang tải dữ liệu kế toán...</div>
          ) : !payoutRequests || payoutRequests.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4 opacity-50">👍</span>
              <p className="text-slate-500 font-bold">Hiện không có lệnh rút tiền nào đang chờ duyệt.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b font-bold">Mã Lệnh / Người yêu cầu</th>
                    <th className="p-4 border-b font-bold">Số Tiền Rút</th>
                    <th className="p-4 border-b font-bold">Tài Khoản Nhận</th>
                    <th className="p-4 border-b font-bold text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payoutRequests.map((payout) => (
                    <tr key={payout._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-sky-700 mb-1">
                          #{payout._id.substring(payout._id.length - 8).toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                            {payout.sellerId?.name || payout.sellerId?.username || 'Tài khoản người dùng'}
                        </div>
                        <div className="text-xs text-slate-500">{new Date(payout.createdAt).toLocaleString('vi-VN')}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-black text-emerald-600 text-xl">{payout.amount.toLocaleString('vi-VN')} đ</div>
                      </td>

                      <td className="p-4">
                        <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl inline-block min-w-[250px]">
                          <div className="text-xs font-bold text-sky-800 uppercase mb-1">{payout.bankInfo?.bankName}</div>
                          <div className="font-mono text-lg font-black text-slate-800 tracking-wider leading-none mb-1">
                            {payout.bankInfo?.accountNumber}
                          </div>
                          <div className="text-xs font-bold text-slate-600 uppercase">👤 {payout.bankInfo?.accountName}</div>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                          <button 
                            onClick={() => {
                              const amountVND = payout.amount; 
                              const qrMessage = encodeURIComponent(`RUT TIEN ${payout._id}`);
                              const accName = encodeURIComponent(payout.bankInfo.accountName);
                              const qrUrl = `https://img.vietqr.io/image/${payout.bankInfo.bankName}-${payout.bankInfo.accountNumber}-compact2.png?amount=${amountVND}&addInfo=${qrMessage}&accountName=${accName}`;
                              setViewQR({ isOpen: true, url: qrUrl, amountVND, message: decodeURIComponent(qrMessage), targetId: payout._id, type: 'payout' }); 
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            📱 Quét QR CK
                          </button>

                          <div className="flex justify-between items-center mt-1 px-1">
                            <button 
                              onClick={() => handleRejectPayout(payout._id)}
                              className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded transition-colors"
                            >
                              Từ chối
                            </button>
                            <button 
                              onClick={() => handleApprovePayout(payout._id)}
                              className="text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors underline decoration-dotted"
                            >
                              Duyệt tay
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'exceptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h2 className="text-lg font-black text-amber-700">Xử Lý Giao Dịch Thừa / Thiếu Tiền</h2>
          </div>

          {loading && exceptionOrders?.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Đang rà soát đối soát...</div>
          ) : !exceptionOrders || exceptionOrders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4 opacity-50">✨</span>
              <p className="text-slate-500 font-bold">Tuyệt vời! Không có giao dịch lỗi nào cần xử lý.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b font-bold">Mã Đơn / Khách hàng</th>
                    <th className="p-4 border-b font-bold">Thực tế nhận vs Cần thu (VNĐ)</th>
                    <th className="p-4 border-b font-bold text-center">Trạng thái</th>
                    <th className="p-4 border-b font-bold text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exceptionOrders.map((order) => {
                    const isRefundError = order.status.includes('Hoàn tiền');
                    const requiredVND = isRefundError 
                        ? (order.paidAmountVND || Math.round(order.totalAmount * EXCHANGE_RATE))
                        : Math.round(order.totalAmount * EXCHANGE_RATE);
                    const diffText = order.status.includes('thừa') ? 'Chuyển DƯ tiền' : 'Chuyển THIẾU tiền';

                    return (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-sky-700">#{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">👤 {order.userId?.email}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                           <div className="text-sm">Chuẩn mức: <span className="font-bold text-slate-700">{requiredVND.toLocaleString('vi-VN')} đ</span></div>
                           <div className={`text-xs font-bold ${order.status.includes('thừa') ? 'text-fuchsia-600' : 'text-rose-600'}`}>
                             ({diffText})
                           </div>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${order.status.includes('thừa') ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                          <button
                            onClick={() => handleResolveException(order._id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                          >
                            ✅ Duyệt ép (Bỏ qua)
                          </button>
                          <button
                            onClick={() => handleResolveException(order._id, 'cancel')}
                            className="bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 text-sm font-bold px-4 py-2 rounded-xl transition-all"
                          >
                            ❌ Hủy làm lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewQR.isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fadeIn" onClick={() => setViewQR({ isOpen: false, url: '', amountVND: 0, message: '', targetId: null, type: null })}>
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-800 mb-1">Mã QR Chuyển Khoản</h3>
            <p className="text-sm font-bold text-slate-500 mb-4">Số tiền: <span className="text-rose-600">{viewQR.amountVND.toLocaleString('vi-VN')} đ</span></p>
            
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-2 relative overflow-hidden flex justify-center items-center min-h-[350px]">
              <img src={viewQR.url} alt="QR Code" className="w-full h-auto object-contain rounded-xl mix-blend-multiply" />
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(viewQR.message);
                alert('Đã copy cú pháp: ' + viewQR.message);
              }}
              className="mt-4 w-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold py-2.5 rounded-xl border border-sky-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              📋 Copy: {viewQR.message}
            </button>

            <p className="text-xs text-center text-slate-500 mt-3 italic leading-relaxed">
              Dùng ứng dụng ngân hàng quét mã này.<br/>Hệ thống sẽ điền sẵn STK, Số Tiền và tự động đối soát.
            </p>

            <button 
              onClick={() => setViewQR({ isOpen: false, url: '', amountVND: 0, message: '', targetId: null, type: null })}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

    </div>
  );
}; // 🌟 ĐÂY CHÍNH LÀ DẤU NGOẶC ĐÓNG COMPONENT BẠN BỊ THIẾU Ở CODE CŨ

export default FinanceManagement;