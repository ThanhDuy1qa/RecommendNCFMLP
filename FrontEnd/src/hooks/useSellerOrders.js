import { useState, useEffect } from 'react';

export const useSellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/orders/seller-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

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
        fetchSellerOrders();
        // Cập nhật chuông thông báo nếu cần (từ logic cũ của bạn)
        if (newStatus !== 'Chờ xác nhận') {
          window.location.reload(); 
        }
      } else {
        alert("❌ Có lỗi xảy ra khi cập nhật!");
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
    }
  };

  return { orders, loading, handleUpdateStatus };
};