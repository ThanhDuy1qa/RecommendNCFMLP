import { useState, useEffect } from 'react';

export const useManageAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Hàm lấy dữ liệu từ API chung của hệ thống
  const fetchProducts = async (pageNumber, searchKey = '') => {
    setLoading(true);
    try {
      // Sử dụng API getProducts đã có sẵn ở Backend
      const res = await fetch(`http://localhost:5000/api/products?page=${pageNumber}&limit=20&search=${searchKey}`);
      const data = await res.json();

      if (res.ok) {
        if (pageNumber === 1) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }
        setHasMore(data.length === 20); // Nếu trả về đủ 20 cái thì khả năng vẫn còn trang tiếp
      }
    } catch (err) {
      console.error("Lỗi tải toàn bộ sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, search);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, search);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("CẢNH BÁO: Bạn đang xóa sản phẩm với quyền Admin. Hành động này không thể hoàn tác!")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("✅ Đã xóa sản phẩm khỏi hệ thống!");
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      alert("❌ Lỗi khi xóa sản phẩm.");
    }
  };

  return { products, loading, search, hasMore, handleSearchChange, loadMore, handleDeleteProduct };
};