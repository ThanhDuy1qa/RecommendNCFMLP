import React from 'react';
import { Navigate } from 'react-router-dom';

// allowedRoles là một mảng chứa các quyền được phép vào. Ví dụ: [2] cho Admin, [1, 2] cho Seller & Admin
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('user');

  // 1. Kiểm tra xem đã đăng nhập chưa
  if (!userStr) {
    alert('Vui lòng đăng nhập để tiếp tục!');
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  // 2. Kiểm tra xem quyền (role) của user có nằm trong danh sách được phép không
  if (!allowedRoles.includes(user.role)) {
    alert('Cảnh báo: Bạn không có quyền truy cập trang này!');
    
    // Nếu là Seller đi lạc vào nhà Admin -> Đá về kho hàng của Seller
    if (user.role === 1) {
      return <Navigate to="/seller/my-products" replace />;
    }
    
    // Nếu là người dùng thường -> Đá về trang chủ
    return <Navigate to="/" replace />;
  }

  // 3. Nếu mọi thứ hợp lệ, cho phép hiển thị nội dung trang
  return children;
};

export default ProtectedRoute;