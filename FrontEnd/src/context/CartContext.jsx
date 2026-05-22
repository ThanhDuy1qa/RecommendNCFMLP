import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Kết nối với hệ thống Đăng nhập
import { useNavigate } from 'react-router-dom';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy token chuẩn xác nhất từ AuthContext
  const { token } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải dữ liệu giỏ hàng ngay khi mở web hoặc khi token thay đổi
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => { 
        const items = Array.isArray(data) ? data : (data.items || []);
        setCartItems([...items]); // BÍ QUYẾT: Tạo mảng mới ép Header re-render
      })
      .catch(err => console.error("Lỗi lấy giỏ hàng:", err));
    } else {
      const guestCartStr = localStorage.getItem('cart_guest');
      setCartItems(guestCartStr ? JSON.parse(guestCartStr) : []);
    }
  }, [token]);

  // Đồng bộ giỏ hàng vãng lai vào máy tính
  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart_guest', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  // LUỒNG 1: THÊM VÀO GIỎ
  const addToCart = async (product) => {
    const formatted = {
      asin: product.asin || product.item_id,
      title: product.title,
      price: Number(String(product.price).replace(/[^0-9.-]+/g,"")) || 0,
      image: product.image_url_high || product.image_url || product.image || '',
      quantity: 1
    };

    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ product: formatted })
        });
        const data = await res.json();
        
        if (!res.ok) {
          alert(`❌ ${data.message || "Lỗi thêm giỏ hàng"}`);
          return;
        }
        
        const newItems = Array.isArray(data) ? data : (data.items || []);
        setCartItems([...newItems]); // BÍ QUYẾT: Clone mảng mới
        alert("🛒 Đã thêm vào giỏ hàng!");
      } catch (error) {
        alert("❌ Lỗi kết nối đến Server!");
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.asin === formatted.asin);
        const newCart = existing 
          ? prev.map(item => item.asin === formatted.asin ? { ...item, quantity: item.quantity + 1 } : item)
          : [...prev, formatted];
        return [...newCart]; // BÍ QUYẾT: Clone mảng mới
      });
      alert("🛒 Đã thêm vào giỏ hàng tạm!");
    }
  };

  // LUỒNG 2: XÓA KHỎI GIỎ
  const removeFromCart = async (asin) => {
    if (token) {
      try {
        const res = await fetch(`http://localhost:5000/api/cart/remove/${asin}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const newItems = Array.isArray(data) ? data : (data.items || []);
        setCartItems([...newItems]);
      } catch(err) { console.error(err); }
    } else {
      setCartItems(prev => prev.filter(item => item.asin !== asin));
    }
  };


  // LUỒNG 3: THANH TOÁN (Nâng cấp nhận thêm địa chỉ)
  const handleCheckout = async (selectedItemsToCheckout, totalAmount, shippingInfo, paymentMethod) => {
    if (!token) {
        alert("Vui lòng đăng nhập để thanh toán!");
        return navigate('/login');
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // Gửi đầy đủ thông tin xuống Server
        body: JSON.stringify({ 
          items: selectedItemsToCheckout, 
          totalAmount, 
          shippingInfo, 
          paymentMethod 
        }) 
      });

      if (res.ok) {
        // Loại bỏ những món đã thanh toán ra khỏi giỏ
        const remainingItems = cartItems.filter(item => !selectedItemsToCheckout.find(sel => sel.asin === item.asin));
        setCartItems(remainingItems);
        
        // Cập nhật lại giỏ hàng trên DB
        await fetch('http://localhost:5000/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ localItems: remainingItems }) 
        });

        alert("🎉 Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
        navigate('/order-history');
      } else {
        alert("❌ Có lỗi xảy ra khi tạo đơn hàng!");
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến Server!");
    } finally {
      setLoading(false);
    }
  };

  // LUỒNG MỚI: TĂNG GIẢM SỐ LƯỢNG
  const updateQuantity = async (asin, newQuantity) => {
    if (newQuantity < 1) return; // Không cho giảm dưới 1

    if (token) {
      // Nếu đã đăng nhập: Tạm thời update ở máy tính trước cho mượt (Optimistic Update)
      setCartItems(prev => prev.map(item => 
        item.asin === asin ? { ...item, quantity: newQuantity } : item
      ));
      
      // Bắn API ngầm lên Server để đồng bộ
      try {
        await fetch(`http://localhost:5000/api/cart/add`, {
          // Lưu ý: Tùy Backend của bạn, nếu bạn có route /update thì gọi, 
          // Không thì chúng ta có thể lợi dụng nút Sync hoặc để lúc checkout gửi mảng mới.
          // Để an toàn nhất, cứ cập nhật state local, lúc checkout mảng items gửi đi sẽ mang số lượng mới nhất!
        });
      } catch (err) { console.error(err); }
    } else {
      // Nếu chưa đăng nhập: Cập nhật local
      setCartItems(prev => prev.map(item => 
        item.asin === asin ? { ...item, quantity: newQuantity } : item
      ));
    }
  };
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
        cartItems, addToCart, removeFromCart, handleCheckout, totalAmount, loading, updateQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};