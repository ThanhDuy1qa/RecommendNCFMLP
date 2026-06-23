import { useState, useEffect } from 'react';

export const useFinanceAdmin = () => {
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [exceptionOrders, setExceptionOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, platformProfit: 0, recentOrders: [], hasMore: false }); 
  const [loading, setLoading] = useState(true);
  
  // 🌟 THÊM STATE ĐỂ QUẢN LÝ TRANG (PAGINATION)
  const [revenuePage, setRevenuePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFinanceData = async (silent = false) => {
    if (!silent) setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [payoutRes, exceptionRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/finance/admin/payouts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/orders/admin/exceptions', { headers: { 'Authorization': `Bearer ${token}` } }),
        // 🌟 GỌI TRANG 1 LÚC LOAD LẦN ĐẦU
        fetch('http://localhost:5000/api/finance/admin/overview?page=1&limit=20', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (payoutRes.ok) setPayoutRequests(await payoutRes.json());
      if (exceptionRes.ok) setExceptionOrders(await exceptionRes.json());
      if (statsRes.ok) {
        setStats(await statsRes.json());
        setRevenuePage(1); // Reset về trang 1
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu tài chính:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { fetchFinanceData(); }, []);

  // 🌟 THÊM HÀM LOAD MORE (XEM THÊM)
  const loadMoreRevenue = async () => {
    if (loadingMore || !stats.hasMore) return;
    
    setLoadingMore(true);
    const nextPage = revenuePage + 1;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://localhost:5000/api/finance/admin/overview?page=${nextPage}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setStats(prev => ({
          ...prev, // Giữ nguyên tổng tiền
          recentOrders: [...prev.recentOrders, ...data.recentOrders], // Nối mảng mới vào sau mảng cũ
          hasMore: data.hasMore
        }));
        setRevenuePage(nextPage);
      }
    } catch (error) {
      console.error("Lỗi tải thêm:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const handleRejectPayout = async (payoutId) => {
    if (!window.confirm("Từ chối lệnh rút này? Tiền sẽ hoàn lại vào ví ảo của Seller.")) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/finance/admin/payouts/${payoutId}/reject`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert("✅ Đã từ chối lệnh rút tiền!");
      setPayoutRequests(prev => prev.filter(p => p._id !== payoutId));
    }
  };

  const handleResolveException = async (orderId, action) => {
    const actionText = action === 'approve' ? "DUYỆT ÉP cho đơn hàng này đi tiếp?" : "HỦY ĐƠN để đưa về tab Hoàn tiền?";
    if (!window.confirm(`Bạn muốn ${actionText}`)) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/orders/admin/exceptions/${orderId}/resolve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    if (res.ok) {
      alert("✅ Đã xử lý ngoại lệ thành công!");
      setExceptionOrders(prev => prev.filter(o => o._id !== orderId));
      fetchFinanceData(true); 
    }
  };

  return { 
    payoutRequests, exceptionOrders, stats, loading, 
    handleApprovePayout, handleRejectPayout, handleResolveException,
    refreshData: () => fetchFinanceData(true),
    loadMoreRevenue, loadingMore
  };
};