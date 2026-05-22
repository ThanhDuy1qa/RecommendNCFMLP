import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth'; // Gọi AuthContext vào

export const useHeader = () => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // 1. LẤY DATA TỪ CONTEXT (Không cần state cục bộ hay useEffect nữa)
  const { user, logout } = useAuth();

  // 2. XỬ LÝ NÚT ĐĂNG NHẬP / ĐĂNG XUẤT
  const handleAuthAction = () => {
    if (user) {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        logout(); // Gọi hàm dọn dẹp từ Context
        navigate('/'); // Chuyển về trang chủ
      }
    } else {
      navigate('/login');
    }
  };

  // Gợi ý tìm kiếm (Debounce 300ms)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/products/suggest?q=${encodeURIComponent(searchInput)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Lỗi load gợi ý:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    setShowSuggestions(false);
    navigate(`/?search=${encodeURIComponent(searchInput)}`);
  };

  const handleSuggestionClick = (asin) => {
    setShowSuggestions(false);
    setSearchInput(""); 
    navigate(`/product/${asin}`); 
  };

  return {
    searchInput, setSearchInput,
    suggestions, showSuggestions, setShowSuggestions,
    wrapperRef, handleSearchSubmit, handleSuggestionClick,
    loggedInUser: user, // Gán user vào biến cũ để file Header.jsx bên ngoài không cần sửa gì cả
    handleAuthAction
  };
};