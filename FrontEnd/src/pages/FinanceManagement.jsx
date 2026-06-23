import React, { useState } from 'react';
import { useFinanceAdmin } from '../hooks/useFinanceAdmin';

const FinanceManagement = () => {
  const { 
    refundRequests, payoutRequests, loading, 
    handleConfirmRefund, handleApprovePayout, handleRejectPayout 
  } = useFinanceAdmin();
  
  const [activeTab, setActiveTab] = useState('refunds');

  // 🌟 ĐÃ CẬP NHẬT: Thêm trường 'message' để lưu nội dung Copy truyền vào Popup
  const [viewQR, setViewQR] = useState({ isOpen: false, url: '', amountVND: 0, message: '' });
  const EXCHANGE_RATE = 25000; 

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <span className="text-4xl">🏦</span> Quản Lý Tài Chính & Đối Soát
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Trung tâm kiểm soát dòng tiền, xử lý ngoại lệ và thanh toán đối tác.</p>
      </div>

      {/* CÁC THẺ THỐNG KÊ TỔNG QUAN DÒNG TIỀN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm border-l-4 border-l-sky-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Tổng Doanh Thu Cổng</p>
          <p className="text-2xl font-black text-sky-700 mt-1">$45,230.00</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Lợi Nhuận Nền Tảng (Phí)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">$4,523.00</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Cần Hoàn Khách (Hủy đơn)</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{refundRequests.length} Yêu cầu</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Seller Chờ Rút Tiền</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{payoutRequests.length} Lệnh</p>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG TABS */}
      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
        {[
          { id: 'refunds', icon: '💸', label: 'Hoàn Tiền Khách (Hủy)' },
          { id: 'exceptions', icon: '⚠️', label: 'Giao Dịch Lỗi (Thừa/Thiếu)' },
          { id: 'payouts', icon: '🏪', label: 'Thanh Toán Seller' },
          { id: 'logs', icon: '🧾', label: 'Lịch Sử Giao Dịch' }
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

      {/* =========================================
          KHU VỰC TAB 1: YÊU CẦU HOÀN TIỀN KHÁCH HÀNG
          ========================================= */}
      {activeTab === 'refunds' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
            <h2 className="text-lg font-black text-rose-700">🔴 Yêu Cầu Hoàn Tiền Chờ Xử Lý</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Đang tải dữ liệu kế toán...</div>
          ) : refundRequests.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4 opacity-50">🎉</span>
              <p className="text-slate-500 font-bold">Không có yêu cầu hoàn tiền nào đang tồn đọng.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b font-bold">Mã Đơn / Thời gian</th>
                    <th className="p-4 border-b font-bold">Số Tiền Hoàn</th>
                    <th className="p-4 border-b font-bold">Tài Khoản Nhận</th>
                    <th className="p-4 border-b font-bold text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {refundRequests.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-sky-700">#{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(order.updatedAt).toLocaleString('vi-VN')}</div>
                      </td>
                      <td className="p-4">
                        {order.paidAmountVND ? (
                            <div>
                            <div className="font-black text-rose-600 text-xl">{order.paidAmountVND.toLocaleString('vi-VN')} đ</div>
                            <div className="text-xs text-slate-500 font-medium">Đã thanh toán thực tế</div>
                            </div>
                        ) : (
                            <div>
                            <div className="font-black text-rose-600 text-lg">${order.totalAmount.toFixed(2)}</div>
                            <div className="text-xs text-slate-500 font-medium">Chưa ghi nhận VND</div>
                            </div>
                        )}
                      </td>
                      <td className="p-4">
                        {order.refundInfo ? (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl inline-block min-w-[250px]">
                            <div className="text-xs font-bold text-amber-800 uppercase mb-1">{order.refundInfo.bankName}</div>
                            <div className="font-mono text-lg font-black text-slate-800 tracking-wider leading-none mb-1">
                              {order.refundInfo.accountNumber}
                            </div>
                            <div className="text-xs font-bold text-slate-600 uppercase">{order.refundInfo.accountName}</div>
                          </div>
                        ) : (
                          <span className="text-rose-500 text-sm font-bold">Khách chưa nhập thông tin!</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                          
                          {/* 🌟 NÚT CHÍNH: QUÉT QR ĐỂ TỰ ĐỘNG XỬ LÝ */}
                          <button 
                            onClick={() => {
                              const amountVND = order.paidAmountVND || Math.round(order.totalAmount * EXCHANGE_RATE);
                              const qrMessage = `HOAN TIEN ${order._id}`;
                              const accName = encodeURIComponent(order.refundInfo.accountName);
                              const qrUrl = `https://img.vietqr.io/image/${order.refundInfo.bankName}-${order.refundInfo.accountNumber}-compact2.png?amount=${amountVND}&addInfo=${encodeURIComponent(qrMessage)}&accountName=${accName}`;
                              setViewQR({ isOpen: true, url: qrUrl, amountVND, message: qrMessage });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            📱 Quét QR CK
                          </button>

                          {/* 🌟 NÚT PHỤ: DÙNG LÀM BACKUP */}
                          <button 
                            onClick={() => handleConfirmRefund(order._id)}
                            className="text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors underline decoration-dotted mt-1"
                            title="Chỉ dùng khi Webhook bị lỗi hoặc thanh toán tiền mặt"
                          >
                            Xác nhận thủ công
                          </button>
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

      {/* =========================================
          KHU VỰC TAB 3: THANH TOÁN SELLER
          ========================================= */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-amber-700">🏪 Lệnh Rút Tiền Từ Seller</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Đang tải dữ liệu kế toán...</div>
          ) : payoutRequests.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4 opacity-50">👍</span>
              <p className="text-slate-500 font-bold">Hiện không có lệnh rút tiền nào đang chờ duyệt.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b font-bold">Mã Lệnh / Người bán</th>
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
                        <div className="text-sm font-bold text-slate-800">{payout.sellerId?.name || payout.sellerId?.username}</div>
                        <div className="text-xs text-slate-500">{new Date(payout.createdAt).toLocaleString('vi-VN')}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-black text-emerald-600 text-xl">${payout.amount.toFixed(2)}</div>
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
                          
                          {/* 🌟 NÚT CHÍNH: QUÉT QR */}
                          <button 
                            onClick={() => {
                              const amountVND = Math.round(payout.amount * EXCHANGE_RATE);
                              const qrMessage = `RUT TIEN ${payout._id}`;
                              const accName = encodeURIComponent(payout.bankInfo.accountName);
                              const qrUrl = `https://img.vietqr.io/image/${payout.bankInfo.bankName}-${payout.bankInfo.accountNumber}-compact2.png?amount=${amountVND}&addInfo=${encodeURIComponent(qrMessage)}&accountName=${accName}`;
                              setViewQR({ isOpen: true, url: qrUrl, amountVND, message: qrMessage });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            📱 Quét QR CK
                          </button>

                          {/* 🌟 CỤM NÚT PHỤ: BACKUP KHI LỖI */}
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
                              title="Chỉ dùng khi Webhook lỗi"
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

      {/* =========================================
          CÁC TAB KHÁC
          ========================================= */}
      {activeTab === 'exceptions' && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
          <span className="text-5xl block mb-4 opacity-50">⚠️</span>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Xử Lý Giao Dịch Thừa / Thiếu Tiền</h3>
          <p className="text-slate-500">Nơi kế toán liên hệ khách hàng để yêu cầu chuyển bù hoặc hoàn lại phần dư.</p>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
          <span className="text-5xl block mb-4 opacity-50">🧾</span>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Lịch Sử Biến Động Số Dư (Webhook Logs)</h3>
          <p className="text-slate-500">Lịch sử toàn bộ các lệnh tiền vào (SePay) và tiền ra (Admin chuyển).</p>
        </div>
      )}

      {/* =========================================
          🌟 POPUP HIỂN THỊ MÃ QR ĐÃ TÍCH HỢP NÚT COPY
          ========================================= */}
      {viewQR.isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fadeIn" onClick={() => setViewQR({ isOpen: false, url: '', amountVND: 0, message: '' })}>
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-800 mb-1">Mã QR Chuyển Khoản</h3>
            <p className="text-sm font-bold text-slate-500 mb-4">Số tiền: <span className="text-rose-600">{viewQR.amountVND.toLocaleString('vi-VN')} đ</span></p>
            
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-2 relative overflow-hidden flex justify-center items-center min-h-[350px]">
              <img src={viewQR.url} alt="QR Code" className="w-full h-auto object-contain rounded-xl mix-blend-multiply" />
            </div>

            {/* 🌟 NÚT COPY ĐƯỢC CHUYỂN VÀO ĐÂY, KÈM HIỂN THỊ NỘI DUNG CÚ PHÁP ĐỂ NHÌN THẤY RÕ */}
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
              onClick={() => setViewQR({ isOpen: false, url: '', amountVND: 0, message: '' })}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceManagement;