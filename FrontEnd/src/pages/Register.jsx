import React from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

const Register = () => {
    // 🌟 GỌI THÊM isSuccess TỪ HOOK
    const { 
        formData, handleChange, error, loading, isSuccess, handleRegister,
        resendLoading, resendMessage, handleResendEmail
    } = useRegister();
    return (
        <div className="min-h-screen bg-sky-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-sky-200 shadow-xl overflow-hidden transition-all duration-500">
                
                {/* 🌟 NẾU ĐĂNG KÝ THÀNH CÔNG -> HIỆN MÀN HÌNH KIỂM TRA EMAIL */}
                {isSuccess ? (
                    <div className="text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-sky-200">
                            📧
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-3">Kiểm Tra Hộp Thư!</h2>
                        <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                            Chúng tôi vừa gửi một liên kết xác nhận đến địa chỉ email: <br/>
                            <strong className="text-sky-700 bg-sky-50 px-2 py-1 rounded-md inline-block mt-2 border border-sky-100">{formData.email}</strong>
                        </p>
                        
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 mb-8 font-medium">
                            Vui lòng mở Mailtrap (hoặc hộp thư của bạn) và click vào liên kết để kích hoạt tài khoản.
                        </div>

                        {/* 🌟 THÊM KHỐI CODE "CHƯA NHẬN ĐƯỢC MAIL" VÀO ĐÂY */}
                        <div className="mb-8">
                            <p className="text-sm text-slate-500 mb-2">Chưa nhận được email?</p>
                            <button 
                                onClick={handleResendEmail}
                                disabled={resendLoading}
                                className="text-sky-600 font-bold underline hover:text-sky-700 disabled:text-slate-400 disabled:no-underline transition-colors text-sm"
                            >
                                {resendLoading ? 'Đang gửi lại...' : 'Gửi lại email xác nhận'}
                            </button>
                            {/* Hiển thị thông báo khi bấm gửi lại */}
                            {resendMessage && (
                                <p className={`mt-2 text-sm font-bold ${resendMessage.includes('✅') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {resendMessage}
                                </p>
                            )}
                        </div>

                        <Link 
                            to="/login" 
                            className="w-full inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-lg transition-all"
                        >
                            Đã hiểu & Quay lại Đăng nhập
                        </Link>
                    </div>
                ) : (
                    /* 🌟 NẾU CHƯA THÀNH CÔNG -> VẪN HIỆN FORM ĐĂNG KÝ NHƯ CŨ */
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-sky-200 shadow-sm">
                                📝
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Tạo Tài Khoản</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Điền thông tin để tham gia hệ thống</p>
                        </div>
                        
                        {error && (
                            <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm text-center">
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">Họ và tên hiển thị</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="VD: Khách hàng #123" className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">Tên đăng nhập (Username)</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Nhập tên đăng nhập viết liền..." className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">Địa chỉ Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Nhập email của bạn..." className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">Mật khẩu</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Tối thiểu 6 ký tự..." minLength="6" className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" />
                            </div>

                            <button type="submit" disabled={loading} className="w-full mt-6 bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm font-medium text-slate-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold underline transition-colors">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;