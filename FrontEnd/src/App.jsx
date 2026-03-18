import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Header from './components/Header';
import Footer from './components/Footer'; // Thêm dòng này
import Admin from './pages/Admin';

const App = () => {
  return (
    <Router>
      {/* ĐÃ THÊM: flex và flex-col để dàn trang theo chiều dọc */}
      <div className="bg-slate-900 min-h-screen flex flex-col">
        
        {/* Header luôn nằm trên cùng */}
        <Header /> 
        
        {/* ĐÃ THÊM: flex-grow giúp phần nội dung web tự động giãn ra, đẩy Footer xuống đáy */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:asin" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Footer luôn nằm dưới cùng */}
        <Footer />

      </div>
    </Router>
  );
};

export default App;