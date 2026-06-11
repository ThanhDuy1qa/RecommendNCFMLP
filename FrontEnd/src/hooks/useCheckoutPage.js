import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './useCart'; // Đảm bảo đường dẫn này khớp với project của bạn
import { AuthContext } from '../context/AuthContext';

export const useCheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { handleCheckout, loading } = useCart();
  const { user } = useContext(AuthContext);

  // State cho Form điền thông tin
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định là COD

  // Kiểm tra tính hợp lệ của dữ liệu truyền từ Giỏ hàng sang
  const hasValidState = state && state.selectedItems && state.selectedItems.length > 0;
  const selectedItems = hasValidState ? state.selectedItems : [];
  const totalAmount = hasValidState ? state.totalAmount : 0;

  // Xử lý thay đổi input form
  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  // Xử lý submit form
  const onSubmit = (e) => {
    e.preventDefault();
    handleCheckout(selectedItems, totalAmount, shippingInfo, paymentMethod);
  };

  // Hàm quay lại giỏ hàng
  const goBackToCart = () => {
    navigate('/cart');
  };

  return {
    user,
    hasValidState,
    shippingInfo,
    paymentMethod,
    setPaymentMethod,
    handleChange,
    onSubmit,
    selectedItems,
    totalAmount,
    loading,
    goBackToCart
  };
};