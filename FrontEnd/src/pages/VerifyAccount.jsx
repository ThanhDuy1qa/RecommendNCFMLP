import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Đường dẫn không hợp lệ. Thiếu mã xác nhận!');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/verify-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Tài khoản của bạn đã được kích hoạt thành công!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Xác thực thất bại!');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau!');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-sky-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-sky-200 shadow-xl text-center">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-6"></div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Đang xử lý...</h2>
                        <p className="text-slate-500 font-medium">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                            ✅
                        </div>
                        <h2 className="text-2xl font-black text-emerald-700 mb-2">Hoàn Tất!</h2>
                        <p className="text-slate-600 font-medium mb-8">{message}</p>
                        
                        <Link 
                            to="/login" 
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                            ❌
                        </div>
                        <h2 className="text-2xl font-black text-rose-700 mb-2">Thất bại</h2>
                        <p className="text-rose-600 font-medium mb-8 px-4">{message}</p>
                        
                        <Link 
                            to="/register" 
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center"
                        >
                            Quay lại trang Đăng ký
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyAccount;