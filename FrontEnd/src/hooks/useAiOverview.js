import { useState, useEffect } from 'react';

export const useAiOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [topScenario, setTopScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Lỗi xác thực: Không tìm thấy Token đăng nhập!");
        }

        // =============================================================
        // 🌟 ĐÃ SỬA: GỌI SONG SONG 2 API ĐỂ LẤY CẢ DASHBOARD LẪN SCENARIO
        // =============================================================
        const [dashRes, scenarioRes] = await Promise.all([
          fetch('http://localhost:5000/api/analytics/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          // Gọi API mà bạn vừa phát hiện ra:
          fetch('http://localhost:5000/api/products/admin/scenario-summary', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        const dashData = await dashRes.json();

        if (!dashRes.ok) {
          throw new Error(dashData.message || `Server báo lỗi mã ${dashRes.status}`);
        }

        // Lưu dữ liệu Dashboard
        setDashboardData(dashData);
        
        // =============================================================
        // 🌟 BÓC TÁCH DỮ LIỆU TOP 1 SCENARIO TỪ API MỚI 
        // =============================================================
        if (scenarioRes.ok) {
            const scenarioList = await scenarioRes.json();
            
            if (scenarioList && scenarioList.length > 0) {
                const bestScenario = scenarioList[0];
                
                setTopScenario({ 
                    scenario: bestScenario.scenario, 
                    
                    // 🌟 ĐÃ SỬA: Dò tìm lần lượt các tên biến điểm số mà AI có thể đặt, nếu không có mới trả về 0
                    final_user_based_score: 
                        bestScenario.final_model_demand_scenario_score || 
                        bestScenario.final_marketing_scenario_score ||
                        bestScenario.final_user_based_inventory_score || 
                        bestScenario.final_score || 
                        0 
                });
            }
        }

      } catch (err) {
        console.error("Chi tiết lỗi ở Hook useAiOverview:", err);
        setError(err.message || "Mất kết nối đến máy chủ Backend!");
      } finally {
        setLoading(false); 
      }
    };

    fetchDashboardData();
  }, []);

  return { dashboardData, topScenario, loading, error };
};