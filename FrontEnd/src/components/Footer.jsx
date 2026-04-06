import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột 1: Giới thiệu */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Về Kho Điện Tử</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Web gợi ý sản phẩm Amazon 
            </p>
          </div>

          {/* Cột 2: Nhóm phát triển */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Nhóm Phát Triển</h3>
            <ul className="text-sm space-y-2">
            </ul>
          </div>

          {/* Cột 3: Công nghệ sử dụng */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Công Nghệ Ứng Dụng</h3>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Kho Điện Tử - DATN Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;