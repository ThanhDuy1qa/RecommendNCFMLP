import { useState, useEffect, useRef } from 'react';

export const useAdminSearch = () => {
  const [userInput, setUserInput] = useState("");
  const [userHistory, setUserHistory] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searched, setSearched] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Debounce API Gợi ý
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

  // Hàm gọi API tìm kiếm
  const executeSearch = async (keyword) => {
    if (!keyword.trim()) return;
    setLoadingSearch(true);
    setSearched(true);
    setShowSuggestions(false);
    
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

  const handleGetRecommendations = () => {
    alert(`Đang gửi ID [${userInput}] sang Server Python AI... (Chờ tích hợp)`);
  };

  // Trả về toàn bộ State và Function để UI sử dụng
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
    handleGetRecommendations
  };
};