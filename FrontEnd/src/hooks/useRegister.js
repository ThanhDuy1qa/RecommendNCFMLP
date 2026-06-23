import { useState } from 'react';

export const useRegister = () => {
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); 

    // 🌟 THÊM 2 STATE CHO CHỨC NĂNG GỬI LẠI EMAIL
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
            
            setIsSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 THÊM HÀM GỬI LẠI EMAIL
    const handleResendEmail = async () => {
        setResendLoading(true);
        setResendMessage('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }) // Lấy email khách vừa nhập
            });
            const data = await res.json();
            
            if (res.ok) {
                setResendMessage("✅ " + data.message);
            } else {
                setResendMessage("❌ " + data.message);
            }
        } catch (error) {
            setResendMessage("❌ Lỗi kết nối đến máy chủ!");
        } finally {
            setResendLoading(false);
        }
    };

    // Nhớ return thêm các biến/hàm mới ra ngoài
    return { 
        formData, handleChange, error, loading, isSuccess, handleRegister,
        resendLoading, resendMessage, handleResendEmail 
    };
};