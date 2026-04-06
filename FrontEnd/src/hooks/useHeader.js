import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHeader = () => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Lấy user từ local storage khi load trang
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Xử lý Login / Logout
  const handleLoginLogout = async () => {
    if (currentUser) {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?")) {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        window.location.reload(); 
      }
    } else {
      const id = window.prompt("Vui lòng nhập Reviewer ID của bạn (VD: A192HO2ICJ75VU):");
      if (!id || !id.trim()) return;

      try {
        const res = await fetch(`http://localhost:5000/api/reviews/user/${encodeURIComponent(id.trim())}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const userName = data[0].reviewerName || "Khách hàng ẩn danh";
          const userObj = { id: id.trim(), name: userName };
          
          localStorage.setItem('currentUser', JSON.stringify(userObj));
          setCurrentUser(userObj);
          
          alert(`Đăng nhập thành công! Chào mừng ${userName} quay trở lại!`);
          window.location.reload(); 
        } else {
          alert("Không tìm thấy khách hàng nào với ID này trong hệ thống!");
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi kết nối Server khi đăng nhập!");
      }
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
    currentUser, wrapperRef,
    handleLoginLogout, handleSearchSubmit, handleSuggestionClick
  };
};