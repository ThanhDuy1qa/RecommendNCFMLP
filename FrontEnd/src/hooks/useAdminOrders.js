import { useState, useEffect } from 'react';

export const useAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 🌟 THÊM STATE TÌM KIẾM & LỌC
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // Chỉ tìm khi bấm nút Enter hoặc nút Tìm
  const [statusFilter, setStatusFilter] = useState('');

  const [paymentFilter, setPaymentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAllOrders = async (pageNum = 1, currentSearch = '', currentStatus = '', currentPayment = '', currentStart = '', currentEnd = '') => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/orders/admin/all-orders?page=${pageNum}&limit=50`;
      
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
      if (currentStatus) url += `&status=${encodeURIComponent(currentStatus)}`;
      if (currentPayment) url += `&paymentMethod=${encodeURIComponent(currentPayment)}`;
      if (currentStart) url += `&startDate=${encodeURIComponent(currentStart)}`;
      if (currentEnd) url += `&endDate=${encodeURIComponent(currentEnd)}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        if (pageNum === 1) {
          setOrders(data.orders || []);
        } else {
          setOrders(prev => [...prev, ...(data.orders || [])]);
        }
        setTotalOrders(data.totalOrders || 0);
        setHasMore(pageNum < (data.totalPages || 1));
      }
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 MỚI: Lắng nghe thêm sự thay đổi của paymentFilter, startDate, endDate
  useEffect(() => {
    setPage(1);
    fetchAllOrders(1, activeSearch, statusFilter, paymentFilter, startDate, endDate);
  }, [activeSearch, statusFilter, paymentFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAllOrders(nextPage, activeSearch, statusFilter, paymentFilter, startDate, endDate);
  };
  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/update-status/${orderId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }) 
      });

      if (res.ok) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert("❌ Có lỗi xảy ra khi cập nhật!");
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
    }
  };

  // 🌟 Xuất thêm các biến và hàm mới ra để UI sử dụng
  return { 
    orders, loading, handleUpdateStatus, loadMore, hasMore, totalOrders,
    search, setSearch, statusFilter, setStatusFilter, handleSearchSubmit,
    paymentFilter, setPaymentFilter, startDate, setStartDate, endDate, setEndDate,
    activeSearch, setActiveSearch
  };
};