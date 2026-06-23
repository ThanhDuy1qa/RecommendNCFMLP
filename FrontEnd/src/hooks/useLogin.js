import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth'; // Gọi AuthContext vào

export const useLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); // Lấy hàm login từ Context

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Đăng nhập thất bại");
            }

            if (res.ok) {
                alert('Đăng nhập thành công!');
                
                // 🌟 1. THUẬT TOÁN GỘP GIỎ HÀNG LÊN SERVER TRƯỚC
                const guestCartStr = localStorage.getItem('cart_guest');
                if (guestCartStr && JSON.parse(guestCartStr).length > 0) {
                    const localItems = JSON.parse(guestCartStr);
                    await fetch('http://localhost:5000/api/cart/sync', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.token}` // Dùng luôn token từ response
                        },
                        body: JSON.stringify({ localItems })
                    });
                }

                // 🌟 2. DỌN SẠCH RÁC TRONG LOCAL STORAGE UNCONDITIONALLY (Luôn luôn xóa)
                localStorage.removeItem('cart_guest');

                // 🌟 3. CẤP QUYỀN ĐĂNG NHẬP SAU KHI ĐÃ ĐỒNG BỘ XONG
                // Lúc này CartContext sẽ bắt được token và tải về giỏ hàng đã được gộp chuẩn xác!
                login(data.user, data.token);

                // 4. CHUYỂN HƯỚNG MƯỢT MÀ BẰNG NAVIGATE
                if (data.user.role === 1) {
                    navigate('/seller/my-products');
                } else if (data.user.role === 2) {
                    navigate('/admin/dashboard');   
                } else {
                    // 🌟 KIỂM TRA ĐIỀU KIỆN KÉP
                    const noPreferences = !data.user.preferences || data.user.preferences.length === 0;
                    const noHistory = !data.user.hasPurchaseHistory;

                    // Chỉ đẩy vào Onboarding khi KHÔNG có sở thích VÀ KHÔNG có lịch sử mua hàng
                    if (noPreferences && noHistory) {
                        navigate('/onboarding');
                    } else {
                        navigate('/'); // Nếu có 1 trong 2 thì cho về thẳng trang chủ                 
                    }
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { username, setUsername, password, setPassword, error, loading, handleLogin };
};