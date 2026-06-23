import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext'; 

export const useUserProfile = () => {
  // 1. Lấy user và token từ hệ thống đăng nhập
  const { user, setUser, token } = useContext(AuthContext);

  // --- STATE FORM ĐỔI TÊN ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // --- STATE FORM ĐỔI MẬT KHẨU ---
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Gắn thông tin hiện tại vào ô input khi load trang
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');       
      setAddress(user.address || '');
    }
  }, [user]);

  // LUỒNG 1: XỬ LÝ ĐỔI TÊN VÀ THÔNG TIN
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
        body: JSON.stringify({ name, phone, address })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ " + data.message);
        
        // Cập nhật thông tin vào Local Storage để không bị mất khi F5
        const updatedUser = { ...user, ...data.user }; 
        localStorage.setItem('user', JSON.stringify(updatedUser)); 
        setUser(updatedUser);
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

  // 🌟 TRẢ CÁC BIẾN VÀ HÀM RA NGOÀI CHO TRANG PROFILE DÙNG
  return {
    user,
    name, setName,
    isUpdatingName,
    passwords, setPasswords,
    isUpdatingPass,
    handleUpdateName,
    handleUpdatePassword,
    phone, setPhone, 
    address, setAddress
  };
};