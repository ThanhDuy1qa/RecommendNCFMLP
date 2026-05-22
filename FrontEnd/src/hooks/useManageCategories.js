import { useState, useEffect } from 'react';

export const useManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // --- STATE QUẢN LÝ MODAL THÊM/SỬA ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({ name: '', image_url: '', description: '' });
  
  // State lưu trữ File ảnh vật lý và Link xem trước (Preview)
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // 1. Hàm Load Danh mục từ Backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Mở Modal Thêm mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', image_url: '', description: '' });
    setImageFile(null);
    setPreviewUrl('');
    setShowModal(true);
  };

  // 3. Mở Modal Cập nhật (Sửa)
  const handleOpenEdit = (category) => {
    setEditingId(category._id);
    setFormData({ 
      name: category.name || '', 
      image_url: category.image_url || '', 
      description: category.description || '' 
    });
    setImageFile(null);
    setPreviewUrl(category.image_url || '');
    setShowModal(true);
  };

  // 4. Xử lý khi Admin chọn ảnh từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 5. Xử lý Lưu (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Vui lòng nhập tên danh mục!");

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId 
      ? `http://localhost:5000/api/categories/${editingId}` 
      : 'http://localhost:5000/api/categories';

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description || '');
    
    if (imageFile) {
      submitData.append('image', imageFile);
    } else if (formData.image_url) {
      submitData.append('image_url', formData.image_url);
    }

    try {
      const res = await fetch(url, {
        method: method,
        body: submitData 
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Lỗi xử lý!");
      
      alert(data.message);
      setShowModal(false);
      fetchCategories(); 
    } catch (error) {
      alert(error.message);
    }
  };

  // 6. Hàm xử lý Xóa
  const handleDeleteCategory = async (id, catName) => {
    if (window.confirm(`⚠️ Bạn có chắc chắn muốn xóa danh mục [${catName}]?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Lỗi xóa danh mục!");
        
        alert(data.message);
        fetchCategories(); 
      } catch (error) {
        alert(`❌ ${error.message}`); 
      }
    }
  };

  return {
    loading,
    search, setSearch,
    showModal, setShowModal,
    editingId,
    formData, setFormData,
    previewUrl,
    filteredCategories,
    handleOpenAdd,
    handleOpenEdit,
    handleFileChange,
    handleSubmit,
    handleDeleteCategory
  };
};