import { useState, useEffect } from 'react';

export const useManageAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // 🌟 THÊM MỚI: STATE QUẢN LÝ DANH MỤC
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // 🌟 THÊM MỚI: GỌI API LẤY TẤT CẢ DANH MỤC KHI VỪA VÀO TRANG
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // HÀM LẤY SẢN PHẨM (Đã nâng cấp để nhận thêm biến category)
  const fetchProducts = async (pageNumber, searchKey = '', category = '') => {
    setLoading(true);
    try {
      // Bổ sung param category vào URL (Nếu Backend của bạn hỗ trợ lọc)
      let url = `http://localhost:5000/api/products?page=${pageNumber}&limit=20&search=${searchKey}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        if (pageNumber === 1) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }
        setHasMore(data.length === 20); 
      }
    } catch (err) {
      console.error("Lỗi tải toàn bộ sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 CẬP NHẬT: Gọi lại API nếu ô tìm kiếm hoặc danh mục thay đổi
  useEffect(() => {
    fetchProducts(1, search, selectedCategory);
  }, [search, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // 🌟 THÊM MỚI: HÀM XỬ LÝ KHI CHỌN DANH MỤC
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1); // Reset về trang 1 khi đổi danh mục
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, search, selectedCategory);
  };

  const handleDeleteProduct = async (idOrAsin) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/delete/${idOrAsin}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('✅ Xóa sản phẩm thành công!');
        
        // 🌟 THÊM DÒNG NÀY: Lọc bỏ sản phẩm vừa xóa khỏi danh sách hiện tại
        setProducts(prevProducts => 
          prevProducts.filter(product => 
            product.asin !== idOrAsin && product.item_id !== idOrAsin && product._id !== idOrAsin
          )
        );
        
      } else {
        alert('❌ Có lỗi xảy ra khi xóa!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { 
    products, loading, search, hasMore, handleSearchChange, loadMore, handleDeleteProduct,
    // 🌟 XUẤT CÁC BIẾN NÀY RA ĐỂ GIAO DIỆN (JSX) CÓ THỂ SỬ DỤNG
    categories, selectedCategory, handleCategoryChange 
  };
};