import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; 
import { useNavigate } from 'react-router-dom';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => { 
        const items = Array.isArray(data) ? data : (data.items || []);
        setCartItems([...items]); 
      })
      .catch(err => console.error("Lỗi lấy giỏ hàng:", err));
    } else {
      const guestCartStr = localStorage.getItem('cart_guest');
      setCartItems(guestCartStr ? JSON.parse(guestCartStr) : []);
    }
  }, [token]);

  // 🌟 ĐÃ XÓA: Hàm useEffect tự động lưu (Thủ phạm gây lỗi nhân đôi)

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
        setCartItems([...newItems]); 
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
        
        // 🌟 SỬA Ở ĐÂY: Lưu trực tiếp vào bộ nhớ khi khách bấm thêm
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        return [...newCart]; 
      });
      alert("🛒 Đã thêm vào giỏ hàng tạm!");
    }
  };

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
      setCartItems(prev => {
        // 🌟 SỬA Ở ĐÂY: Cập nhật lại bộ nhớ khi khách bấm xóa
        const newCart = prev.filter(item => item.asin !== asin);
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const handleCheckout = async (selectedItemsToCheckout, totalAmount, shippingInfo, paymentMethod) => {
    if (!token) {
        alert("Vui lòng đăng nhập để thanh toán!");
        navigate('/login');
        return null; 
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          items: selectedItemsToCheckout, 
          totalAmount, 
          shippingInfo, 
          paymentMethod 
        }) 
      });

      if (res.ok) {
        const data = await res.json();
        const remainingItems = cartItems.filter(item => !selectedItemsToCheckout.find(sel => sel.asin === item.asin));
        setCartItems(remainingItems);
        
        await fetch('http://localhost:5000/api/cart/replace', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ items: remainingItems }) 
        });
        return data.order || data; 
      } else {
        alert("❌ Có lỗi xảy ra khi tạo đơn hàng!");
        return null;
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến Server!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (asin, newQuantity) => {
    if (newQuantity < 1) return; 

    if (token) {
      // 1. Cập nhật state local ngay lập tức cho mượt (Optimistic Update)
      setCartItems(prev => prev.map(item => 
        item.asin === asin ? { ...item, quantity: newQuantity } : item
      ));
      
      // 2. Bắn API gọi route '/update' ở Backend
      try {
        await fetch(`http://localhost:5000/api/cart/update`, {
          method: 'PUT', // Phải dùng PUT vì ở route khai báo router.put('/update', ...)
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Truyền vé (token) để verifyToken cho qua
          },
          body: JSON.stringify({ 
            asin: asin, 
            quantity: newQuantity 
          }) 
        });
      } catch (err) { 
        console.error("Lỗi đồng bộ số lượng:", err); 
      }
    } else {
      setCartItems(prev => {
        // 🌟 Lưu lại số lượng khi khách chưa đăng nhập bấm (+/-)
        const newCart = prev.map(item => item.asin === asin ? { ...item, quantity: newQuantity } : item);
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        return newCart;
      });
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