import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext'; 

export const useUserProfile = () => {
  // 1. ĐÃ SỬA: Lấy thêm hàm setUser từ AuthContext
  const { user, setUser, token } = useContext(AuthContext);

  // --- STATE FORM ĐỔI TÊN ---
  const [name, setName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // --- STATE FORM ĐỔI MẬT KHẨU ---
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Gắn tên hiện tại vào ô input khi load trang
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // LUỒNG 1: XỬ LÝ ĐỔI TÊN
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Tên không được để trống!");
    
    setIsUpdatingName(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ " + data.message);
        
        // 2. ĐÃ SỬA: Cập nhật thông tin mới vào Local Storage và State toàn cục
        const updatedUser = { ...user, name: name };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Giữ tên không bị mất khi F5
        setUser(updatedUser); // Header và UI sẽ tự động update ngay lập tức!
        
        // (Đã xóa dòng window.location.reload() để web chạy mượt mà)
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối Server!");
    } finally {
      setIsUpdatingName(false);
    }
  };

  // LUỒNG 2: XỬ LÝ ĐỔI MẬT KHẨU
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("❌ Mật khẩu xác nhận không khớp!");
    }
    if (passwords.newPassword.length < 6) {
      return alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
    }

    setIsUpdatingPass(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ " + data.message);
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' }); 
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối Server!");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return {
    user,
    name, setName,
    isUpdatingName,
    passwords, setPasswords,
    isUpdatingPass,
    handleUpdateName,
    handleUpdatePassword
  };
};