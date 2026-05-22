import { useState, useEffect } from 'react';

export const useUserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Hệ thống từ chối! Bạn cần đăng nhập để xem thông tin.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/reviews/my-history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setReviews(data);
        } else {
          setError(data.message || 'Không thể tải lịch sử tương tác đánh giá từ máy chủ.');
        }
      } catch (err) {
        setError('Lỗi kết nối trục trặc mạng đường truyền tới Server.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  return { reviews, loading, error };
};