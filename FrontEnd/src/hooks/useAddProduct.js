import { useState, useEffect } from 'react';

export const useAddProduct = () => {
  const [formData, setFormData] = useState({
    asin: '', title: '', brand: '', price: '', 
    main_cat: '', category: "['Electronics']", description: ''
  });

  const [dbCategories, setDbCategories] = useState([]); 
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE MỚI: Quản lý file vật lý và link xem trước ảnh
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchExistingCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        if (Array.isArray(data)) {
          const catNames = data.map(cat => cat.name);
          setDbCategories(catNames);
          if (catNames.length > 0) {
            setFormData(prev => ({ ...prev, main_cat: catNames[0] }));
          }
        }
      } catch (err) {
        console.error("Không thể lấy danh mục:", err);
      }
    };
    fetchExistingCategories();
  }, []);

  const generateUniqueAsin = async () => {
    let isUnique = false;
    let newAsin = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    while (!isUnique) {
      newAsin = 'B0';
      for (let i = 0; i < 8; i++) {
        newAsin += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      try {
        const res = await fetch(`http://localhost:5000/api/products/${newAsin}`);
        if (res.status === 404) {
          isUnique = true; // Không tìm thấy trên DB nghĩa là mã chưa ai dùng
        } 
      } catch (err) {
        console.error("Lỗi khi kiểm tra mã ASIN:", err);
        isUnique = true; 
      }
    }
    setFormData(prev => ({ ...prev, asin: newAsin }));
  };

  useEffect(() => {
    generateUniqueAsin();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hàm hứng file khi người dùng chọn từ máy tính
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
    if (!token) {
      setMessage('❌ Từ chối truy cập! Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
      return; 
    }

    setIsLoading(true);
    setMessage('');

    // ĐÓNG GÓI DẠNG FORMDATA (Để Multer Backend bắt được file)
    const submitData = new FormData();
    submitData.append('asin', formData.asin);
    submitData.append('title', formData.title);
    submitData.append('brand', formData.brand);
    submitData.append('price', formData.price);
    submitData.append('main_cat', formData.main_cat);
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    
    if (imageFile) {
      submitData.append('image', imageFile); // Trùng với 'image' ở uploadCloud.single('image')
    }

    try {
      const res = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` // KHÔNG cài Content-Type
        },
        body: submitData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ ' + data.message);
        setFormData({
          asin: '', title: '', brand: '', price: '', 
          main_cat: dbCategories[0] || '', category: "['Electronics']", description: ''
        });

        await generateUniqueAsin();
        
        setImageFile(null);
        setPreviewUrl('');
      } else {
        setMessage('❌ ' + data.message); 
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối tới Server');
    } finally {
      setIsLoading(false);
    }
  };
  

  return { 
    formData, setFormData, dbCategories, message, isLoading, 
    handleChange, handleSubmit, previewUrl, handleFileChange, 
    generateUniqueAsin 
  };
};