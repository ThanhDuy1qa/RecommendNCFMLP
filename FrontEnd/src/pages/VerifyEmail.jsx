import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const VerifyEmail = () => {
    const [status, setStatus] = useState({ loading: true, message: 'Đang xác thực...', success: false });
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            fetch('http://localhost:5000/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200) {
                    // Thành công: Xóa token cũ bắt đăng nhập lại, chuyển hướng sang trang Login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login', { state: { successMessage: 'Đổi Email thành công! Vui lòng đăng nhập lại với thông tin mới.' } });
                } else {
                    setStatus({ loading: false, message: body.message, success: false });
                }
            })
            .catch(() => setStatus({ loading: false, message: 'Lỗi kết nối máy chủ.', success: false }));
        } else {
            setStatus({ loading: false, message: 'Đường link không hợp lệ!', success: false });
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-md text-center max-w-sm w-full border border-sky-200">
                <h2 className="text-2xl font-black text-sky-800 mb-4">Xác nhận Email</h2>
                <div className="font-medium text-slate-600 mb-6">
                    {status.loading ? <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div> : status.message}
                </div>
                {!status.loading && (
                    <Link to="/" className="inline-block bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-sky-500">
                        Về trang chủ
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;