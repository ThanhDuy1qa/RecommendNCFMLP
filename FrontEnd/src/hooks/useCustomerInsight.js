import { useState, useEffect, useRef } from 'react';

export const useCustomerInsight = () => {
  const [userInput, setUserInput] = useState("");
  const [userHistory, setUserHistory] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searched, setSearched] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // --- STATE MỚI CHO AI ---
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Gợi ý tìm kiếm (Debounce 150ms)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (userInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/suggest?q=${encodeURIComponent(userInput)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Lỗi load gợi ý user:", error);
      }
    };
    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 150);
    return () => clearTimeout(delayDebounceFn);
  }, [userInput]);

  // Click ra ngoài đóng gợi ý
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeSearch = async (keyword) => {
    if (!keyword.trim()) return;
    setLoadingSearch(true);
    setSearched(true);
    setShowSuggestions(false);
    
    // Xóa kết quả AI cũ khi tìm người mới
    setRecommendations([]); 
    
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/user/${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setUserHistory(data);
    } catch (err) {
      console.error("Lỗi tìm người dùng:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(userInput);
  };

  const handleSuggestionClick = (reviewerID) => {
    setUserInput(reviewerID);
    executeSearch(reviewerID);
  };

  // --- HÀM GỌI AI ĐÃ ĐƯỢC LÀM HOÀN CHỈNH ---
  const handleGetRecommendations = async () => {
    if (!userInput) return;
    setLoadingRecs(true);
    setRecommendations([]);

    try {
      // 1. Gọi sang Python lấy mã ASIN
      const aiRes = await fetch(`http://localhost:8000/api/recommend/${encodeURIComponent(userInput)}?top_k=9`);
      if (!aiRes.ok) throw new Error("Lỗi Cold Start: Khách hàng chưa đủ dữ liệu!");
      
      const aiData = await aiRes.json();
      const asins = aiData.recommendations;

      // 2. Gọi sang Node.js để lấy hình ảnh, tên và giá
      if (asins && asins.length > 0) {
        const nodeRes = await fetch(`http://localhost:5000/api/products/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asins })
        });
        const productsData = await nodeRes.json();
        setRecommendations(productsData);
      }
    } catch (error) {
      console.warn("Lỗi AI:", error);
      alert(error.message);
    } finally {
      setLoadingRecs(false);
    }
  };

  return {
    userInput, setUserInput,
    userHistory,
    loadingSearch,
    searched,
    suggestions,
    showSuggestions, setShowSuggestions,
    wrapperRef,
    handleSearchSubmit,
    handleSuggestionClick,
    handleGetRecommendations,
    // Trả ra ngoài cho component Admin dùng
    recommendations, loadingRecs 
  };
};