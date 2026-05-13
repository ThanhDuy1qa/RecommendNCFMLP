import { useState, useEffect } from 'react';

export const useAddProduct = () => {
  const [formData, setFormData] = useState({
    item_id: '', title: '', brand: '', price: '', 
    main_cat: '', category: "['Electronics']", image_url_high: '', description: ''
  });

  const [dbCategories, setDbCategories] = useState([]); 
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExistingCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/categories');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDbCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, main_cat: data[0] }));
          }
        }
      } catch (err) {
        console.error("Không thể lấy danh mục:", err);
      }
    };
    fetchExistingCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('❌ Từ chối truy cập! Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
      return; 
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ ' + data.message);
        setFormData(prev => ({
          ...prev, item_id: '', title: '', brand: '', price: '', image_url_high: '', description: ''
        }));
      } else {
        setMessage('❌ ' + data.message); 
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối tới Server');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, dbCategories, message, isLoading, handleChange, handleSubmit };
};