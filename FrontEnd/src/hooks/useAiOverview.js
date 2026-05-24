import { useState, useEffect } from 'react';

export const useAiOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [topScenario, setTopScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Biến lưu trữ lỗi

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null); // Xóa lỗi cũ mỗi lần nạp lại trang

        // 1. KIỂM TRA MẠNG & TOKEN
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Lỗi xác thực: Không tìm thấy Token đăng nhập!"); // Ném lỗi văng thẳng xuống catch
        }

        // 2. GỌI API
        const response = await fetch('http://localhost:5000/api/analytics/dashboard', {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        });
        
        const resData = await response.json();

        // 3. BẮT LỖI TỪ BACKEND TRẢ VỀ (403, 404, 500)
        // Nếu Server báo response.ok là false, ta sẽ lấy dòng message của Backend để hiển thị
        if (!response.ok) {
          throw new Error(resData.message || `Server báo lỗi mã ${response.status}`);
        }

        // 4. LƯU DỮ LIỆU NẾU THÀNH CÔNG
        setDashboardData(resData);
        
        // Trích xuất topScenario nếu có
        if (resData?.selected) {
           setTopScenario({ 
             scenario: resData.selected.best_inventory_scenario, 
             final_user_based_score: resData.model_metrics?.find(m => m.metric === 'score')?.value || 0 
           });
        }

      } catch (err) {
        // ==========================================
        // NƠI HỘI TỤ MỌI LỖI (CATCH)
        // ==========================================
        console.error("Chi tiết lỗi ở Hook useAiOverview:", err);
        
        // Gán câu lỗi vào state 'error', giao diện Dashboard.jsx sẽ nhận được và hiện hộp màu đỏ!
        setError(err.message || "Mất kết nối đến máy chủ Backend!");
      } finally {
        // Dù thành công hay thất bại cũng phải tắt vòng xoay loading
        setLoading(false); 
      }
    };

    fetchDashboardData();
  }, []);

  return { dashboardData, topScenario, loading, error };
};