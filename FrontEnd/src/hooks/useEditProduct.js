import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const useEditProduct = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    item_id: '', title: '', brand: '', price: '', 
    main_cat: '', description: '', image_url_high: ''
  });
  
  const [dbCategories, setDbCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('http://localhost:5000/api/products/categories');
        const catData = await catRes.json();
        if (Array.isArray(catData)) setDbCategories(catData);

        const prodRes = await fetch(`http://localhost:5000/api/products/detail/${id}`);
        const prodData = await prodRes.json();
        
        if (prodRes.ok) {
          setFormData({
            item_id: prodData.item_id || '',
            title: prodData.title || '',
            brand: prodData.brand || '',
            price: prodData.price || '',
            main_cat: prodData.main_cat || '',
            description: prodData.description || '',
            image_url_high: prodData.image_url_high || prodData.image_url || ''
          });
        } else {
          setMessage('❌ ' + (prodData.message || 'Không tìm thấy thông tin sản phẩm!'));
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setMessage('❌ Lỗi kết nối khi tải dữ liệu sản phẩm.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Từ chối truy cập! Bạn chưa đăng nhập.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch(`http://localhost:5000/api/products/update/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Cập nhật sản phẩm thành công!');
        navigate('/seller/my-products'); 
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối tới Server khi lưu thay đổi.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, dbCategories, message, isLoading, isFetching, handleChange, handleSubmit, navigate };
};