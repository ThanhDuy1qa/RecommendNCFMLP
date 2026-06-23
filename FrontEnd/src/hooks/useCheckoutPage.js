import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './useCart'; 
import { AuthContext } from '../context/AuthContext';

export const useCheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { handleCheckout, loading } = useCart();
  const { user } = useContext(AuthContext);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('WALLET'); 
  const [paymentMode, setPaymentMode] = useState('real_full'); 
  const [liveBalance, setLiveBalance] = useState(0); 

  const hasValidState = state && state.selectedItems && state.selectedItems.length > 0;
  const selectedItems = hasValidState ? state.selectedItems : [];
  const totalAmount = hasValidState ? state.totalAmount : 0;
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Cập nhật thông tin Shipping ngay khi User có data
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || ''
      }));
    }
  }, [user]);

  // LOGIC LẤY SỐ DƯ REAL-TIME
  useEffect(() => {
  if (user) {
    setLiveBalance(user.walletBalance || 0);

    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users/wallet-balance', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setLiveBalance(data.balance);
        } else {
          setLiveBalance(user.walletBalance || 0);
        }
      } catch (error) {
        console.error('Lỗi lấy số dư ví:', error);
        setLiveBalance(user.walletBalance || 0);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }
}, [user]);

  const handleChange = (e) => setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });

  // 🌟 ĐÃ THÊM CHỮ "async" VÀO ĐÂY
  const onSubmit = async (e) => {
    e.preventDefault();
    
    const exchangeRate = 25000;
    const amountInVND = paymentMode === 'test_2k' ? (totalQuantity * 2000) : Math.round(totalAmount * exchangeRate);

    if (paymentMethod === 'WALLET' && liveBalance < amountInVND) {
       alert(`❌ Số dư ví không đủ!\nCần thanh toán: ${amountInVND.toLocaleString('vi-VN')} đ\nSố dư hiện tại: ${liveBalance.toLocaleString('vi-VN')} đ`);
       return;
    }

    // Gửi lệnh tạo đơn
    const orderData = await handleCheckout(selectedItems, totalAmount, shippingInfo, paymentMethod, paymentMode);

    if (orderData && (orderData.success || orderData.order)) {
        // 🌟 THÊM ĐOẠN NÀY: Trừ số tiền đơn hàng vào Số dư hiển thị trên giao diện ngay lập tức
        if (paymentMethod === 'WALLET') {
          setLiveBalance(prevBalance => prevBalance - amountInVND);
          
          // Nếu trên thanh Menu/Navbar của bạn hiển thị tiền dựa vào `user` từ AuthContext,
          // bạn có thể cập nhật nhanh object user để đồng bộ toàn bộ trang web:
          if (user) {
            user.walletBalance -= amountInVND;
          }
        }

        alert("🎉 Đặt hàng thành công!");
        navigate('/order-history');
    } else {
        alert("❌ " + (orderData?.message || "Đặt hàng thất bại. Vui lòng thử lại!"));
    }
  };

  const goBackToCart = () => navigate('/cart');

  return {
    user, hasValidState, shippingInfo, paymentMethod, setPaymentMethod,
    handleChange, onSubmit, selectedItems, totalAmount, loading,
    goBackToCart, totalQuantity, paymentMode, setPaymentMode, liveBalance 
  };
};