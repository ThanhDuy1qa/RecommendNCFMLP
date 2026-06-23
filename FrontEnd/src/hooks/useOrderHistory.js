import { useState, useEffect, useContext } from 'react';
import { useCart } from './useCart';
import { AuthContext } from '../context/AuthContext';

export const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  const [availableYears, setAvailableYears] = useState([]); 
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('');

  const [refundModal, setRefundModal] = useState({ isOpen: false, order: null });

  // LẤY ĐƠN HÀNG VÀ LẤY NĂM
  const fetchOrdersOnly = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      let orderUrl = `http://localhost:5000/api/orders/history?page=1&limit=50`;
      if (activeSearch) orderUrl += `&search=${encodeURIComponent(activeSearch)}`;
      if (activeTab !== 'Tất cả') orderUrl += `&status=${encodeURIComponent(activeTab)}`;
      if (timeFilter) orderUrl += `&timeFilter=${encodeURIComponent(timeFilter)}`;

      const res = await fetch(orderUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      
      if (res.ok) {
        setOrders(data.orders || data || []); 
        if (data.availableYears) setAvailableYears(data.availableYears); 
      }
    } catch (err) {
      console.error("Lỗi đồng bộ Đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsOnly = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/reviews/my-history', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setMyReviews(data);
    } catch (err) {}
  };

  const fetchAllData = () => {
    fetchOrdersOnly();
    fetchReviewsOnly();
  };

  useEffect(() => {
    fetchOrdersOnly();
  }, [activeTab, activeSearch, timeFilter]);

  useEffect(() => {
    fetchReviewsOnly();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handleBuyAgain = (item) => {
    addToCart(item);
  };

  const updateQuantityInOrder = async (orderId, asin, newQuantity) => {
    if (newQuantity < 1) return; 

    const orderToUpdate = orders.find(o => o._id === orderId);
    if (!orderToUpdate) return;

    const updatedItems = orderToUpdate.items.map(item => 
      item.asin === asin ? { ...item, quantity: newQuantity } : item
    );

    callUpdateOrderAPI(orderId, updatedItems);
  };

  const removeItemFromOrder = async (orderId, asin) => {
    if (!window.confirm("Bạn có chắc chắn muốn bỏ sản phẩm này khỏi đơn hàng?")) return;

    const orderToUpdate = orders.find(o => o._id === orderId);
    if (!orderToUpdate) return;

    const updatedItems = orderToUpdate.items.filter(item => item.asin !== asin);

    callUpdateOrderAPI(orderId, updatedItems);
  };

  const callUpdateOrderAPI = async (orderId, newItems) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/update-items/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ items: newItems })
      });
      
      const data = await res.json();
      if (res.ok) {
         fetchOrdersOnly(); 
      } else {
         alert("❌ " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối Server");
    }
  };

  const initiateCancel = (order) => {
    // Chỉ cần xác nhận và gọi API hủy, vì thanh toán Ví tự động hoàn tiền
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      submitCancelOrder(order._id);
    }
  };

  const submitCancelOrder = async (orderId, refundInfo = null) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/cancel/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ refundInfo })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ " + data.message);
        setRefundModal({ isOpen: false, order: null }); 
        fetchOrdersOnly(); 
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleConfirmReceipt = async (orderId) => {
    if (!window.confirm("Xác nhận bạn đã nhận được hàng và sản phẩm không có vấn đề gì? Tiền sẽ được chuyển cho người bán.")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/confirm-receipt/${orderId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ " + data.message);
        fetchOrdersOnly(); 
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  // 🌟 THÊM HÀM GỌI API KHIẾU NẠI VÀO useOrderHistory.js
  const handleReportNotReceived = async (orderId) => {
    if (!window.confirm("Bạn xác nhận CHƯA nhận được hàng? Hệ thống sẽ tạm giữ tiền và đưa vào diện Tranh chấp.")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/report-not-received/${orderId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("⚠️ " + data.message);
        fetchOrdersOnly(); // Load lại trang
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  // NHỚ return hàm này ra ở cuối file useOrderHistory

  return {
    orders, myReviews, loading, fetchAllData, availableYears, 
    activeTab, setActiveTab, search, setSearch, timeFilter, setTimeFilter, handleSearchSubmit, handleBuyAgain,
    updateQuantityInOrder, removeItemFromOrder,
    refundModal, setRefundModal, initiateCancel, submitCancelOrder, handleConfirmReceipt, handleReportNotReceived
  };
};