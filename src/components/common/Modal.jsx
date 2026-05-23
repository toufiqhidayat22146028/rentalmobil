import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ============================================================
// KOMPONEN: Modal
// Dialog popup yang dapat digunakan ulang di seluruh aplikasi.
// Props:
//   - isOpen: boolean
//   - onClose: () => void
//   - title: string
//   - size: 'sm' | 'md' | 'lg' | 'xl'
//   - children: React node (konten modal)
// ============================================================
const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  const overlayRef = useRef(null);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Cegah scroll body saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-lg';

  return (
    // Overlay gelap - klik di overlay untuk tutup
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className={`w-full ${sizeClass} bg-white rounded-2xl shadow-chatbot animate-slide-up overflow-hidden`}>
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-gray-800 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Konten Modal */}
        <div className="p-6 overflow-y-auto max-h-[75vh] chat-scroll">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
