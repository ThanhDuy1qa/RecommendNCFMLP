import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-500 py-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột 1: Giới thiệu */}
          <div>
            <h3 className="text-slate-800 text-lg font-bold mb-4">Về Kho Điện Tử</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Web gợi ý sản phẩm Amazon 
            </p>
          </div>

          {/* Cột 2: Nhóm phát triển */}
          <div>
            <h3 className="text-slate-800 text-lg font-bold mb-4">Nhóm Phát Triển</h3>
            <ul className="text-sm space-y-2 text-slate-500">
            </ul>
          </div>

          {/* Cột 3: Công nghệ sử dụng */}
          <div>
            <h3 className="text-slate-800 text-lg font-bold mb-4">Công Nghệ Ứng Dụng</h3>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 mt-8 pt-6 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Kho Điện Tử Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;