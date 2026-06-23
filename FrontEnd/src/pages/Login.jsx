import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { Link } from 'react-router-dom';

const Login = () => {
    const { username, setUsername, password, setPassword, error, loading, handleLogin } = useLogin();

    return (
        <div className="min-h-screen bg-sky-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-sky-200 shadow-xl">
                
                {/* TIÊU ĐỀ */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-sky-200 shadow-sm">
                        🔐
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Đăng Nhập</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Vui lòng đăng nhập để vào hệ thống</p>
                </div>
                
                {/* THÔNG BÁO LỖI */}
                {error && (
                    <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm text-center">
                        ⚠️ {error}
                    </div>
                )}

                {/* FORM ĐĂNG NHẬP */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Tên đăng nhập</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Nhập tên đăng nhập..."
                            className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Nhập mật khẩu..."
                            className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm font-medium text-slate-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-sky-600 hover:text-sky-700 font-bold underline transition-colors">
                        Đăng ký ngay
                    </Link>
                </div>  
            </div>
        </div>
    );
};

export default Login;