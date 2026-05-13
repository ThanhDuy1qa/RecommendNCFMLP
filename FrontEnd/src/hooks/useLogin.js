import { useState } from 'react';

export const useLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user)); 

                if (data.user.role === 1) {
                    window.location.href = '/seller/my-products';
                } else if (data.user.role === 2) {
                    window.location.href = '/admin/dashboard';   
                } else {
                    window.location.href = '/';                  
                }
            } else {
                alert('❌ ' + data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { username, setUsername, password, setPassword, error, loading, handleLogin };
};