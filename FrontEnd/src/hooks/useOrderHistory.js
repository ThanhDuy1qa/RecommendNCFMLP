import { useState, useEffect } from 'react';

export const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false); // true: Chỉ đọc, false: Được sửa/Viết mới
  const [isEditingExisting, setIsEditingExisting] = useState(false); // Phân biệt giữa sửa đánh giá cũ và viết đánh giá mới
  const [reviewData, setReviewData] = useState({
    asin: '',
    title: '',
    overall: 5,
    summary: '',
    reviewText: ''
  });

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        fetch('http://localhost:5000/api/orders/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/reviews/my-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();
      
      if (ordersRes.ok) setOrders(ordersData);
      if (reviewsRes.ok) setMyReviews(reviewsData);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openReviewModal = (asin, title, existingReview = null) => {
    if (existingReview) {
      // Nếu đã có đánh giá cũ -> Mở lên ở chế độ chỉ đọc xem trước
      setReviewData({
        asin,
        title,
        overall: existingReview.overall,
        summary: existingReview.summary,
        reviewText: existingReview.reviewText
      });
      setIsReadOnly(true);
      setIsEditingExisting(true); // Đánh dấu đây là luồng chỉnh sửa
    } else {
      // Nếu chưa có -> Mở form trống để viết mới
      setReviewData({ asin, title, overall: 5, summary: '', reviewText: '' });
      setIsReadOnly(false);
      setIsEditingExisting(false);
    }
    setShowModal(true);
  };

  // Hàm xử lý khi nhấn nút "Gửi" hoặc "Cập nhật"
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Tự động phân luồng API dựa vào trạng thái của Form
    const apiUrl = isEditingExisting 
      ? 'http://localhost:5000/api/reviews/update'  // API PUT nếu là sửa đổi
      : 'http://localhost:5000/api/reviews/add';     // API POST nếu là viết mới
      
    const apiMethod = isEditingExisting ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiUrl, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        setShowModal(false);
        fetchAllData(); // Tải lại dữ liệu để cập nhật UI
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
    }
  };

  return {
    orders,
    myReviews,
    loading,
    showModal, setShowModal,
    isReadOnly, setIsReadOnly,
    isEditingExisting,
    reviewData, setReviewData,
    openReviewModal,
    handleFormSubmit
  };
};