import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 Đã tách riêng icon và label để dễ thiết kế thẻ (Card)
const CATEGORIES = [
    { id: 'laptop', icon: '💻', label: 'Laptop & PC' },
    { id: 'phone', icon: '📱', label: 'Điện thoại' },
    { id: 'audio', icon: '🎧', label: 'Âm thanh' },
    { id: 'accessory', icon: '⌨️', label: 'Phụ kiện' },
    { id: 'smartwatch', icon: '⌚', label: 'Smartwatch' },
    { id: 'camera', icon: '📷', label: 'Máy ảnh' }
];

const Onboarding = () => {
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleCategory = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSubmit = async () => {
        if (selected.length === 0) {
            alert("Vui lòng chọn ít nhất 1 sở thích nhé!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/users/preferences', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ preferences: selected })
            });

            if (res.ok) {
                navigate('/'); // Xong việc thì đẩy về trang chủ
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // 🌟 Nền Gradient kết hợp pattern nhẹ nhàng
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col justify-center items-center p-4 sm:p-8">
            
            {/* 🌟 Khối chính phong cách Kính mờ (Glassmorphism) */}
            <div className="max-w-3xl w-full bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-sky-200/50 border border-white">
                
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 text-sky-600 rounded-full text-3xl mb-4 shadow-inner">
                        👋
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-sky-900 mb-3 tracking-tight">
                        Bạn quan tâm đến điều gì?
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg">
                        Hãy chọn một vài danh mục để chúng tôi tối ưu hóa trải nghiệm mua sắm dành riêng cho bạn!
                    </p>
                </div>

                {/* 🌟 Chuyển từ Flex-wrap sang Grid 2 cột (Mobile) / 3 cột (PC) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 mb-10">
                    {CATEGORIES.map(cat => {
                        const isSelected = selected.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center gap-3 group overflow-hidden ${
                                    isSelected
                                        ? 'bg-sky-50 border-sky-500 shadow-md shadow-sky-500/20'
                                        : 'bg-white border-slate-100 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm'
                                }`}
                            >
                                {/* Dấu tick góc phải khi được chọn */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 bg-sky-500 text-white rounded-full p-1 animate-fadeIn">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                )}

                                <span className={`text-4xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {cat.icon}
                                </span>
                                <span className={`text-sm md:text-base font-bold ${isSelected ? 'text-sky-800' : 'text-slate-600'}`}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                    <button 
                        onClick={handleSubmit}
                        disabled={selected.length === 0 || loading}
                        className="w-full bg-sky-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-sky-500/30 disabled:opacity-50 disabled:shadow-none hover:bg-sky-500 hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
                    >
                        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {loading ? 'Đang thiết lập...' : 'Hoàn tất & Khám phá ngay 🚀'}
                    </button>
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors decoration-slate-300 hover:underline underline-offset-4"
                    >
                        Bỏ qua bước này, tôi muốn tự khám phá
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default Onboarding;