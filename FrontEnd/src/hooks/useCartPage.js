import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './useCart'; // Đảm bảo đường dẫn này đúng với vị trí file useCart của bạn

export const useCartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, loading } = useCart();
  
  // State lưu danh sách ASIN của các sản phẩm được tích chọn
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  // Kiểm tra xem đã chọn tất cả chưa
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  // Hàm xử lý Chọn/Bỏ chọn Tất cả
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]); // Bỏ chọn hết
    } else {
      setSelectedItems(cartItems.map(item => item.asin)); // Chọn tất cả
    }
  };

  // Hàm xử lý Chọn/Bỏ chọn từng món
  const handleSelectItem = (asin) => {
    setSelectedItems(prev => 
      prev.includes(asin) 
        ? prev.filter(id => id !== asin) 
        : [...prev, asin]
    );
  };

  // Tính toán các món được chọn và tổng tiền
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.asin));
  const selectedTotalAmount = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Xóa item khỏi danh sách đã chọn nếu bị xóa khỏi giỏ hàng
  useEffect(() => {
    setSelectedItems(prev => prev.filter(asin => cartItems.some(item => item.asin === asin)));
  }, [cartItems]);

  // Hàm xử lý chuyển hướng thanh toán
  const handleNavigateToCheckout = () => {
    navigate('/checkout', { 
      state: { 
        selectedItems: selectedCartItems, 
        totalAmount: selectedTotalAmount 
      } 
    });
  };

  // Trả về những dữ liệu và hàm mà UI cần
  return {
    cartItems,
    loading,
    removeFromCart,
    updateQuantity,
    selectedItems,
    isAllSelected,
    handleSelectAll,
    handleSelectItem,
    selectedTotalAmount,
    handleNavigateToCheckout
  };
};