import React from 'react';
// 🌟 Đổi import sang thư viện mới: react-quill-new
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

const EmailModal = ({ emailModal, setEmailModal, isSending, onSend }) => {
  if (!emailModal.isOpen) return null;

  // Cấu hình thanh công cụ của trình soạn thảo
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean'] 
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* HEADER MODAL */}
        <div className="bg-sky-600 p-5 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <span>📧</span> {emailModal.isBulk ? 'Gửi Chiến Dịch Hàng Loạt' : 'Soạn Email Cá Nhân'}
          </h3>
          <button 
            onClick={() => !isSending && setEmailModal({...emailModal, isOpen: false})} 
            className="hover:bg-sky-700 p-1.5 rounded-xl transition-colors"
          >
            ❌
          </button>
        </div>
        
        {/* NỘI DUNG SOẠN THẢO */}
        <div className="p-6 space-y-4 text-sm bg-slate-50 overflow-y-auto custom-scrollbar flex-grow">
          
          {/* Người nhận */}
          <div className="flex items-start bg-white p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 w-24 shrink-0 mt-1">Người nhận:</span> 
            <div className="flex flex-wrap gap-1">
              {emailModal.isBulk ? (
                emailModal.to.map((email, i) => (
                  <span key={i} className="font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 text-xs">
                    {email}
                  </span>
                ))
              ) : (
                <span className="font-medium text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">{emailModal.to}</span>
              )}
            </div>
          </div>
          
          {/* Chủ đề */}
          <div className="flex items-center bg-white p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 w-24 shrink-0">Chủ đề:</span> 
            <input 
              type="text"
              className="font-bold text-slate-800 w-full outline-none bg-transparent"
              value={emailModal.subject}
              onChange={(e) => setEmailModal({...emailModal, subject: e.target.value})}
              placeholder="Nhập tiêu đề email..."
            />
          </div>
          
          {/* KHUNG SOẠN THẢO RICH TEXT (GMAIL STYLE) */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={emailModal.htmlBody}
              onChange={(content) => setEmailModal({...emailModal, htmlBody: content})}
              className="h-[250px] pb-10" 
            />
          </div>
        </div>
        
        {/* FOOTER NÚT BẤM */}
        <div className="bg-white p-5 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => !isSending && setEmailModal({...emailModal, isOpen: false})} 
            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            disabled={isSending}
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onSend} 
            disabled={isSending} 
            className={`${emailModal.isBulk ? 'bg-amber-500 hover:bg-amber-400' : 'bg-sky-600 hover:bg-sky-500'} text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait`}
          >
            {isSending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>🚀</span>}
            {isSending ? 'Đang gửi...' : 'Xác nhận Gửi'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailModal;