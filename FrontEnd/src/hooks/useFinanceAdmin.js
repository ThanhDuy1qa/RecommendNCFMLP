import { useState, useEffect } from 'react';

export const useFinanceAdmin = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]); // 🌟 Thêm State lưu lệnh rút tiền
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Gọi song song 2 API để tiết kiệm thời gian
      const [refundRes, payoutRes] = await Promise.all([
        fetch('http://localhost:5000/api/orders/admin/refunds', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/finance/admin/payouts', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (refundRes.ok) setRefundRequests(await refundRes.json());
      if (payoutRes.ok) setPayoutRequests(await payoutRes.json());
      
    } catch (error) {
      console.error("Lỗi tải dữ liệu tài chính:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleConfirmRefund = async (orderId) => {
    if (!window.confirm("Bạn xác nhận đã chuyển khoản thành công cho khách hàng này?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/admin/confirm-refund/${orderId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        // Xóa đơn đã xử lý khỏi danh sách trên màn hình
        setRefundRequests(prev => prev.filter(order => order._id !== orderId));
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  // 🌟 HÀM DUYỆT RÚT TIỀN SELLER
  const handleApprovePayout = async (payoutId) => {
    if (!window.confirm("Bạn xác nhận ĐÃ CHUYỂN KHOẢN thành công cho Seller này?")) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/finance/admin/payouts/${payoutId}/approve`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert("✅ Đã xác nhận thanh toán!");
      setPayoutRequests(prev => prev.filter(p => p._id !== payoutId));
    }
  };

  // 🌟 HÀM TỪ CHỐI RÚT TIỀN SELLER
  const handleRejectPayout = async (payoutId) => {
    if (!window.confirm("Từ chối lệnh rút này? Tiền sẽ được hoàn lại vào ví ảo của Seller.")) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/finance/admin/payouts/${payoutId}/reject`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert("✅ Đã từ chối lệnh rút tiền!");
      setPayoutRequests(prev => prev.filter(p => p._id !== payoutId));
    }
  };

  return { 
    refundRequests, payoutRequests, loading, 
    handleConfirmRefund, handleApprovePayout, handleRejectPayout 
  };
};