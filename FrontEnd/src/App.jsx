import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Stats from './pages/Stats';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingNav from './components/FloatingNav'; // <-- KÉO COMPONENT VÀO ĐÂY

const App = () => {
  return (
    <Router>
      <div className="bg-slate-900 min-h-screen flex flex-col relative">
        <Header /> 
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:asin" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>

        <Footer />
        <FloatingNav /> {/* <-- SỬ DỤNG NHƯ MỘT THẺ HTML BÌNH THƯỜNG */}
      </div>
    </Router>
  );
};

export default App;