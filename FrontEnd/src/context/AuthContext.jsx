import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Đọc dữ liệu từ localStorage khi ứng dụng khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hàm xử lý đăng nhập thành công
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart_guest'); 
  };

  return (
    // ĐÃ SỬA: Bổ sung thêm setUser vào đây để các component khác có thể gọi
    <AuthContext.Provider value={{ user, setUser, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};