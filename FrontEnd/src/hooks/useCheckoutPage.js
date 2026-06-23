import { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './useCart'; 
import { AuthContext } from '../context/AuthContext';

export const useCheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { handleCheckout, loading } = useCart();
  const { user } = useContext(AuthContext);

  const [isOrderCreated, setIsOrderCreated] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentMode, setPaymentMode] = useState('real_full');
  
  // 🌟 THÊM STATE ĐỂ LƯU ID ĐƠN HÀNG VỪA TẠO
  const [createdOrderId, setCreatedOrderId] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD'); 

  const hasValidState = state && state.selectedItems && state.selectedItems.length > 0;
  const selectedItems = hasValidState ? state.selectedItems : [];
  const totalAmount = hasValidState ? state.totalAmount : 0;
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const pollingIntervalRef = useRef(null);

  // 🌟 VÒNG LẶP QUÉT THEO ID ĐƠN HÀNG (TUYỆT ĐỐI CHÍNH XÁC)
  useEffect(() => {
    if (isOrderCreated && createdOrderId && paymentMethod === 'BANK_TRANSFER') {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          // Gửi ID lên API check trạng thái thanh toán
          const res = await fetch(`http://localhost:5000/api/orders/check-payment/${createdOrderId}`);
          const data = await res.json();
          
          if (data.isPaid) {
            clearInterval(pollingIntervalRef.current); 
            if (data.status === 'success') alert("✅ Tuyệt vời! Hệ thống đã nhận ĐỦ tiền.");
            else if (data.status === 'overpaid') alert("🎉 Hệ thống ghi nhận bạn chuyển THỪA tiền.");
            else if (data.status === 'failed') alert("⚠️ CẢNH BÁO: Số tiền bạn chuyển KHÔNG ĐỦ!");
            
            navigate('/order-history'); 
          }
        } catch (error) {
          console.error("Lỗi quét ngầm:", error);
        }
      }, 3000); 
    }
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [isOrderCreated, createdOrderId, paymentMethod, paymentMode, navigate]);

  const handleChange = (e) => setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });

  // 🌟 SỬA LOGIC KHI SUBMIT ĐẶT HÀNG
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Lưu ý: Sửa lại hàm handleCheckout trong useCart của bạn để nó return về dữ liệu API (chứa order)
    // Hoặc nếu không muốn sửa handleCheckout, bạn hãy viết fetch đặt hàng trực tiếp tại đây.
    const orderData = await handleCheckout(selectedItems, totalAmount, shippingInfo, paymentMethod);
    
    if (orderData) {
        if (paymentMethod === 'BANK_TRANSFER') {
            // Giả định hàm handleCheckout trả về object đơn hàng chứa _id
            const orderId = orderData._id || orderData.order?._id; 
            setCreatedOrderId(orderId); 
            setIsOrderCreated(true); // Bật popup
        } else {
            alert("🎉 Đặt hàng thành công!");
            navigate('/order-history');
        }
    }
  };

  const goBackToCart = () => navigate('/cart');

  const handleCancelPayment = () => {
    if (window.confirm("Bạn có chắc chắn muốn thoát tiến trình chuyển khoản này?")) {
      setIsOrderCreated(false);
      navigate('/order-history'); 
    }
  };

  // Check thủ công bằng ID
  const finishPayment = async () => {
    if (!createdOrderId) return;
    setIsChecking(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/check-payment/${createdOrderId}`);
      const data = await res.json();
      if (data.isPaid) {
        alert("✅ Đơn hàng đã nhận được tiền!");
        navigate('/order-history');
      } else {
        alert("⏳ Hệ thống chưa nhận được tiền từ ngân hàng.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

 

  return {
    user, hasValidState, shippingInfo, paymentMethod, setPaymentMethod,
    handleChange, onSubmit, selectedItems, totalAmount, loading,
    goBackToCart, isOrderCreated, finishPayment, isChecking,
    paymentMode, setPaymentMode, totalQuantity, handleCancelPayment,     createdOrderId // Trả ra ngoài cho giao diện dùng
  };
};