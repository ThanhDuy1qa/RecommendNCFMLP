import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const useEditProduct = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    asin: '', title: '', brand: '', price: '', main_cat: '', description: ''
  });
  
  const [dbCategories, setDbCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // BIẾN MỚI: Lưu file mới chọn và hiển thị ảnh cũ/mới
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('http://localhost:5000/api/categories'); 
        const catData = await catRes.json();
        if (Array.isArray(catData)) setDbCategories(catData.map(c => c.name));

        const prodRes = await fetch(`http://localhost:5000/api/products/detail/${id}`); 
        const prodData = await prodRes.json();
        
        if (prodRes.ok) {
          setFormData({
            asin: prodData.asin || prodData.item_id || '',
            title: prodData.title || '',
            brand: prodData.brand || '',
            price: prodData.price || '',
            main_cat: prodData.main_cat || '',
            description: prodData.description || ''
          });
          // VÁ LỖI HIỂN THỊ: Đổ link ảnh cũ trong DB vào ô xem trước
          setPreviewUrl(prodData.image_url_high || prodData.image_url || '');
        } else {
          setMessage('❌ Không tìm thấy thông tin sản phẩm!');
        }
      } catch (err) {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Từ chối truy cập! Bạn chưa đăng nhập.');

    setIsLoading(true);
    setMessage('');

    // ĐÓNG GÓI DỮ LIỆU ĐỂ UP FILE SỬA
    const submitData = new FormData();
    submitData.append('asin', formData.asin);
    submitData.append('title', formData.title);
    submitData.append('brand', formData.brand);
    submitData.append('price', formData.price);
    submitData.append('main_cat', formData.main_cat);
    submitData.append('description', formData.description);
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/update/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitData,
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

  return { formData, dbCategories, message, isLoading, isFetching, handleChange, handleSubmit, navigate, previewUrl, handleFileChange };
};