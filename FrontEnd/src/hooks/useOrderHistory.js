import { useState, useEffect, useRef } from 'react';
import { useCart } from './useCart';

export const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [availableYears, setAvailableYears] = useState([]); 
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('');

  // 🌟 THÊM STATE QUẢN LÝ POPUP THANH TOÁN LẠI
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null); // Lưu đơn hàng đang được chọn thanh toán
  const [isChecking, setIsChecking] = useState(false);
  const [paymentMode, setPaymentMode] = useState('real_full'); // Mặc định chế độ tiền thật

  const [refundModal, setRefundModal] = useState({ isOpen: false, order: null });
  
  const pollingIntervalRef = useRef(null);

  // HÀM 1: CHỈ TẢI ĐƠN HÀNG VÀ LẤY NĂM
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

  // 🌟 VÒNG LẶP TỰ ĐỘNG QUÉT THANH TOÁN KHI MỞ POPUP Ở LỊCH SỬ
  useEffect(() => {
    if (isPaymentModalOpen && paymentOrder) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/orders/check-payment/${paymentOrder._id}`);
          const data = await res.json();
          
          if (data.isPaid) {
            clearInterval(pollingIntervalRef.current); 
            
            if (data.status === 'success') {
                alert("✅ Tuyệt vời! Hệ thống đã nhận ĐỦ tiền. Đơn hàng đã được duyệt!");
            } else if (data.status === 'overpaid') {
                alert("🎉 Hệ thống đã ghi nhận bạn chuyển THỪA tiền, Admin sẽ liên hệ hoàn trả phần dư.");
            } else if (data.status === 'failed') {
                alert("⚠️ CẢNH BÁO: Số tiền bạn chuyển KHÔNG ĐỦ! Đơn hàng bị gán lỗi Thanh toán thiếu.");
            }
            
            closePaymentModal(); // Đóng popup
            fetchOrdersOnly(); // Tải lại danh sách đơn hàng để cập nhật màu sắc
          }
        } catch (error) {
          console.error("Lỗi tự động kiểm tra:", error);
        }
      }, 3000); 
    }
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [isPaymentModalOpen, paymentOrder, paymentMode]);

  // 🌟 CÁC HÀM ĐIỀU KHIỂN POPUP THANH TOÁN LẠI
  const handleOpenPayment = (order) => {
    setPaymentOrder(order);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentOrder(null);
  };

  const finishPayment = async () => {
    if (!paymentOrder) return;
    setIsChecking(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/check-payment/${paymentOrder._id}`);
      const data = await res.json();
      
      if (data.isPaid) {
        if (data.status === 'success') alert("✅ Tuyệt vời! Hệ thống đã nhận ĐỦ tiền.");
        else if (data.status === 'overpaid') alert("🎉 Hệ thống ghi nhận bạn chuyển THỪA tiền.");
        else if (data.status === 'failed') alert("⚠️ CẢNH BÁO: Số tiền bạn chuyển KHÔNG ĐỦ!");
        
        closePaymentModal();
        fetchOrdersOnly();
      } else {
        alert("⏳ Hệ thống chưa nhận được tiền từ ngân hàng. Vui lòng chờ vài giây rồi bấm lại nhé!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsChecking(false);
    }
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handleBuyAgain = (item) => {
    addToCart(item);
  };

  const updateQuantityInOrder = async (orderId, asin, newQuantity) => {
    if (newQuantity < 1) return; // Không cho giảm dưới 1

    const orderToUpdate = orders.find(o => o._id === orderId);
    if (!orderToUpdate) return;

    // Tạo mảng items mới với số lượng được cập nhật
    const updatedItems = orderToUpdate.items.map(item => 
      item.asin === asin ? { ...item, quantity: newQuantity } : item
    );

    // Gọi API cập nhật
    callUpdateOrderAPI(orderId, updatedItems);
  };

  // 🌟 HÀM MỚI 2: XÓA SẢN PHẨM KHỎI ĐƠN HÀNG
  const removeItemFromOrder = async (orderId, asin) => {
    if (!window.confirm("Bạn có chắc chắn muốn bỏ sản phẩm này khỏi đơn hàng?")) return;

    const orderToUpdate = orders.find(o => o._id === orderId);
    if (!orderToUpdate) return;

    // Lọc bỏ sản phẩm bị xóa
    const updatedItems = orderToUpdate.items.filter(item => item.asin !== asin);

    // Gọi API cập nhật
    callUpdateOrderAPI(orderId, updatedItems);
  };

  // HÀM GỌI API CHUNG CHO VIỆC CẬP NHẬT
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
         fetchOrdersOnly(); // Gọi lại hàm load dữ liệu để giao diện tự cập nhật số tiền
      } else {
         alert("❌ " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối Server");
    }
  };

  const initiateCancel = (order) => {
    // Nếu đơn chuyển khoản và đã nhận tiền -> Bật form đòi STK
    if (order.paymentMethod === 'BANK_TRANSFER' && order.status !== 'Chờ xác nhận') {
      setRefundModal({ isOpen: true, order });
    } else {
      // Nếu chưa trả tiền -> Hỏi xác nhận rồi hủy thẳng
      if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
        submitCancelOrder(order._id);
      }
    }
  };

  // 🌟 HÀM GỬI LÊN SERVER
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
        setRefundModal({ isOpen: false, order: null }); // Đóng popup
        fetchOrdersOnly(); // Tải lại giao diện
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
        fetchOrdersOnly(); // Tải lại danh sách
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  return {
    orders, myReviews, loading, fetchAllData, availableYears, 
    activeTab, setActiveTab, search, setSearch, timeFilter, setTimeFilter, handleSearchSubmit, handleBuyAgain,
    // 🌟 TRẢ RA CÁC STATE VÀ HÀM CHO GIAO DIỆN SỬ DỤNG
    isPaymentModalOpen, paymentOrder, paymentMode, setPaymentMode, 
    handleOpenPayment, closePaymentModal, finishPayment, isChecking,
    updateQuantityInOrder, removeItemFromOrder,
    refundModal, setRefundModal, initiateCancel, submitCancelOrder, handleConfirmReceipt
  };
};