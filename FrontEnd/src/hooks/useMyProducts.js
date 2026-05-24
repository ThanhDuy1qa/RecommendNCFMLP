import { useState, useEffect } from 'react';
import { useTopSales } from './useTopSales';

export const useMyProducts = () => {
  // 1. Logic lấy danh sách sản phẩm và danh mục
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // 🌟 THÊM STATE LƯU DANH MỤC
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 🌟 CHẠY SONG SONG 2 API: Lấy Sản phẩm của Seller & Lấy toàn bộ Danh mục
        const [prodRes, catRes] = await Promise.all([
          fetch('http://localhost:5000/api/products/my-products', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/categories') // Lấy danh mục để lấy hình
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (Array.isArray(prodData)) setProducts(prodData);
        if (Array.isArray(catData)) setCategories(catData);
        
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🌟 HÀM TIỆN ÍCH: Dò tìm hình ảnh danh mục dựa vào tên
  const getCategoryImage = (catName) => {
    if (!catName || categories.length === 0) return null;
    // Khớp tên (không phân biệt hoa/thường)
    const matchedCat = categories.find(c => c.name?.toLowerCase() === catName.toLowerCase());
    // Lấy ảnh (Hỗ trợ cả trường 'image' và 'image_url')
    return matchedCat ? (matchedCat.image || matchedCat.image_url) : null;
  };

  // 2. Logic Xóa sản phẩm
  const handleDelete = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/delete/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        setProducts(products.filter(p => p._id !== productId));
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
    }
  };

  // 3. Logic lấy Top Sales và xử lý Slider (Thanh trượt)
  const { topProducts, loadingTop } = useTopSales();
  const [startIdx, setStartIdx] = useState(0);

  const handleNext = () => {
    if (startIdx + 5 < (topProducts?.length || 0)) setStartIdx(prev => prev + 5);
  };

  const handlePrev = () => {
    if (startIdx - 5 >= 0) setStartIdx(prev => prev - 5);
  };

  const visibleTopProducts = (topProducts || []).slice(startIdx, startIdx + 5);

  // =======================================================
  // 🌟 MỚI: HÀM TẢI TỆP KHÁCH HÀNG TIỀM NĂNG CHO TỪNG SẢN PHẨM
  // =======================================================
  const handleDownloadCustomers = async (asin, title) => {
    try {
      const token = localStorage.getItem('token');
      // Gọi API Marketing để lấy tệp khách
      const response = await fetch('http://localhost:5000/api/analytics/marketing-targets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || "Lỗi lấy dữ liệu khách hàng");

      // Bóc tách danh sách user của riêng ASIN này
      const userDetails = data.user_product_detail || [];
      const users = userDetails
        .filter(user => user.asin === asin)
        .sort((a, b) => b.hybrid_score - a.hybrid_score);

      if (users.length === 0) {
        alert(`Sản phẩm "${title}" hiện chưa có tệp khách hàng tiềm năng đủ tốt từ AI!`);
        return;
      }

      // Xây dựng file CSV
      const headers = ['STT', 'User_ID', 'Hybrid_Score', 'Rank'];
      const csvRows = users.map((user, index) => {
        return [
          index + 1,
          `User_${user.user_id}`,
          user.hybrid_score ? user.hybrid_score.toFixed(6) : 'N/A',
          user.rank || 'N/A'
        ].join(','); 
      });

      const csvString = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ads_Target_${asin}.csv`); 
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Lỗi khi trích xuất tệp khách hàng: " + error.message);
    }
  };

  // 4. Trả về tất cả cho giao diện (NHỚ THÊM handleDownloadCustomers VÀO ĐÂY)
  return { 
    products, loading, handleDelete,
    topProducts: topProducts || [], loadingTop,
    startIdx, handleNext, handlePrev, visibleTopProducts,
    getCategoryImage, 
    handleDownloadCustomers // <--- THÊM DÒNG NÀY
  };
};
