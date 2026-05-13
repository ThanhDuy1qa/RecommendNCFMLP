import React from 'react';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
    const { username, setUsername, password, setPassword, error, loading, handleLogin } = useLogin();

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', color: 'white' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng Nhập</h2>
            
            {error && <div style={{ color: '#ff6b6b', backgroundColor: '#3f1d1d', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Tên đăng nhập</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#334155', color: 'white' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#334155', color: 'white' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>
            </form>
        </div>
    );
};

export default Login;