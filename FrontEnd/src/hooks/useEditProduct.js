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

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Lấy role người dùng hiện tại để quyết định đường dẫn quay về
  const userStr = localStorage.getItem('user');
  const userRole = userStr ? JSON.parse(userStr).role : 1;
  const returnPath = userRole === 2 ? '/admin/manage-products' : '/seller/my-products';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Tải danh sách Categories
        const catRes = await fetch('http://localhost:5000/api/categories'); 
        const catData = await catRes.json();
        let loadedCategories = [];
        if (Array.isArray(catData)) {
          loadedCategories = catData.map(c => c.name);
        }

        // 2. Tải thông tin Product
        const prodRes = await fetch(`http://localhost:5000/api/products/detail/${id}`); 
        const prodData = await prodRes.json();
        
        if (prodRes.ok) {
          let currentCat = prodData.main_cat || '';

          // 🌟 THUẬT TOÁN ĐỐI CHIẾU THÔNG MINH (Tự khớp "home audio theater" với "Home Audio & Theater")
          if (currentCat) {
            // Hàm làm sạch chuỗi: Đổi về chữ thường, bỏ dấu &, bỏ khoảng trắng thừa
            const cleanString = (str) => str.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
            const cleanCurrent = cleanString(currentCat);

            // Tìm xem có danh mục chuẩn nào khớp với chuỗi đã làm sạch không
            const matchedCat = loadedCategories.find(cat => cleanString(cat) === cleanCurrent);

            if (matchedCat) {
              currentCat = matchedCat; // Lấy tên chuẩn đẹp, viết hoa đàng hoàng để gán vào form
            } else if (!loadedCategories.includes(currentCat)) {
              loadedCategories.unshift(currentCat); // Nếu rác quá không khớp được, đành nhét tạm vào đầu mảng
            }
          }

          setDbCategories(loadedCategories);

          setFormData({
            asin: prodData.asin || prodData.item_id || '',
            title: prodData.title || '',
            brand: prodData.brand || '',
            price: prodData.price || '',
            main_cat: currentCat, // Gán chính xác danh mục đã chuẩn hóa
            description: prodData.description || ''
          });
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
        navigate(returnPath); 
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối tới Server khi lưu thay đổi.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, dbCategories, message, isLoading, isFetching, handleChange, handleSubmit, navigate, previewUrl, handleFileChange, returnPath };
};