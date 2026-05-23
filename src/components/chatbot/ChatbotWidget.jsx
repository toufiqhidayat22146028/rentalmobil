import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Bot,
  RotateCcw
} from 'lucide-react';
import ChatMessage, { TypingIndicator } from './ChatMessage';
import { WELCOME_MESSAGE, QUICK_REPLIES, getBotResponse } from '../../data/chatbotFAQ';

// ============================================================
// KOMPONEN UTAMA: ChatbotWidget
// Widget chatbot yang mengambang di pojok kanan bawah layar.
//
// ARSITEKTUR STATE:
//   - isOpen: boolean - apakah jendela chat terbuka
//   - messages: array - riwayat seluruh pesan dalam satu sesi
//   - inputText: string - teks yang sedang diketik user
//   - isTyping: boolean - apakah bot sedang "mengetik" (loading)
//   - hasNewMessage: boolean - indikator notifikasi pesan baru
// ============================================================
const ChatbotWidget = () => {
  // State: apakah panel chat terbuka atau tertutup
  const [isOpen, setIsOpen] = useState(false);
  
  // State: array riwayat pesan. Diinisialisasi dengan pesan sambutan.
  // Setiap pesan adalah objek: { id, role, content, timestamp }
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  
  // State: teks yang sedang diketik pengguna di input field
  const [inputText, setInputText] = useState('');
  
  // State: apakah bot sedang "memproses" pesan (tampilkan typing indicator)
  const [isTyping, setIsTyping] = useState(false);
  
  // State: apakah quick replies masih perlu ditampilkan
  // Disembunyikan setelah user mengirim pesan pertama
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  
  // State: notifikasi titik merah pada tombol chatbot
  const [hasNotification, setHasNotification] = useState(true);

  // REF: Referensi ke elemen bawah daftar pesan
  // Digunakan untuk auto-scroll ke pesan terbaru
  const messagesEndRef = useRef(null);
  
  // REF: Referensi ke input field untuk auto-focus
  const inputRef = useRef(null);

  // ============================================================
  // EFEK: Auto-scroll ke bawah setiap kali ada pesan baru
  // atau saat bot sedang mengetik
  // ============================================================
  useEffect(() => {
    // Scroll halus ke elemen paling bawah (messagesEndRef)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]); // Dipicu setiap kali messages atau isTyping berubah

  // ============================================================
  // EFEK: Auto-focus input saat chat dibuka
  // ============================================================
  useEffect(() => {
    if (isOpen) {
      // Sedikit delay agar animasi pembukaan selesai dulu
      setTimeout(() => inputRef.current?.focus(), 300);
      // Hapus notifikasi saat chat dibuka
      setHasNotification(false);
    }
  }, [isOpen]);

  // ============================================================
  // FUNGSI: Membuat objek pesan baru
  // Menghasilkan ID unik berdasarkan timestamp + random number
  // ============================================================
  const createMessage = (role, content) => ({
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,        // 'user' atau 'bot'
    content,     // Isi teks pesan
    timestamp: new Date().toISOString(), // Waktu pesan dibuat
  });

  // ============================================================
  // FUNGSI UTAMA: Mengirim pesan pengguna dan mendapat respons bot
  // ============================================================
  const handleSendMessage = async (text = inputText) => {
    // Validasi: jangan kirim jika teks kosong atau bot sedang mengetik
    const trimmedText = text.trim();
    if (!trimmedText || isTyping) return;

    // 1. Sembunyikan quick replies setelah pesan pertama terkirim
    setShowQuickReplies(false);

    // 2. Tambahkan pesan pengguna ke riwayat chat
    const userMessage = createMessage('user', trimmedText);
    setMessages((prev) => [...prev, userMessage]);
    
    // 3. Kosongkan input field
    setInputText('');

    // 4. Aktifkan animasi "bot sedang mengetik"
    setIsTyping(true);

    // 5. Simulasi delay respons bot (0.8 - 1.5 detik)
    //    Ini membuat chatbot terasa lebih natural dan tidak instant
    const delay = Math.random() * 700 + 800; // Angka acak antara 800ms - 1500ms
    
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 6. Dapatkan respons bot berdasarkan kata kunci
    const botAnswer = getBotResponse(trimmedText);
    
    // 7. Matikan typing indicator
    setIsTyping(false);
    
    // 8. Tambahkan respons bot ke riwayat chat
    const botMessage = createMessage('bot', botAnswer);
    setMessages((prev) => [...prev, botMessage]);
  };

  // ============================================================
  // FUNGSI: Handle tombol Enter untuk mengirim pesan
  // ============================================================
  const handleKeyDown = (e) => {
    // Kirim pesan saat Enter ditekan (bukan Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Mencegah newline pada textarea
      handleSendMessage();
    }
  };

  // ============================================================
  // FUNGSI: Reset/mulai ulang percakapan
  // ============================================================
  const handleReset = () => {
    // Kembalikan pesan ke hanya pesan sambutan awal
    setMessages([WELCOME_MESSAGE]);
    setInputText('');
    setIsTyping(false);
    setShowQuickReplies(true); // Tampilkan kembali quick replies
  };

  // ============================================================
  // FUNGSI: Handle klik quick reply button
  // ============================================================
  const handleQuickReply = (message) => {
    handleSendMessage(message);
  };

  return (
    // ============================================================
    // CONTAINER UTAMA - Fixed di pojok kanan bawah layar
    // z-50 memastikan widget selalu di atas elemen lain
    // ============================================================
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ================================================
          PANEL CHAT - Muncul saat isOpen = true
          Menggunakan conditional rendering + animasi CSS
          ================================================ */}
      {isOpen && (
        <div className="
          w-[360px] sm:w-[380px] 
          bg-white rounded-2xl 
          shadow-chatbot 
          border border-gray-100
          flex flex-col overflow-hidden
          animate-slide-up
          max-h-[540px]
        ">
          {/* ============================================
              HEADER CHAT - Baris atas dengan judul & tombol
              ============================================ */}
          <div className="
            flex items-center justify-between 
            px-4 py-3
            bg-gradient-to-r from-primary-900 to-primary-700
          ">
            {/* Info bot */}
            <div className="flex items-center gap-3">
              {/* Avatar bot dengan indikator online */}
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                {/* Titik hijau indikator online */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary-800 rounded-full" />
              </div>
              
              {/* Nama & status bot */}
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  AsistenBot
                </p>
                <p className="text-primary-200 text-xs">Online • Siap membantu</p>
              </div>
            </div>

            {/* Tombol kontrol: Reset & Tutup */}
            <div className="flex items-center gap-1">
              {/* Tombol reset percakapan */}
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Mulai percakapan baru"
                aria-label="Reset percakapan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              {/* Tombol minimize / tutup chat */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup chat"
                aria-label="Tutup chatbot"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ============================================
              AREA PESAN - Daftar gelembung pesan
              overflow-y-auto: scroll vertikal jika pesan banyak
              chat-scroll: custom scrollbar dari index.css
              ============================================ */}
          <div className="
            flex-1 overflow-y-auto p-4 
            flex flex-col gap-3
            bg-gray-50
            min-h-[300px] max-h-[340px]
            chat-scroll
          ">
            {/* Render semua pesan satu per satu */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Tampilkan typing indicator saat bot sedang memproses */}
            {isTyping && <TypingIndicator />}

            {/* Elemen kosong di bawah sebagai target auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* ============================================
              QUICK REPLIES - Tombol cepat pertanyaan populer
              Hanya tampil saat showQuickReplies = true
              ============================================ */}
          {showQuickReplies && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2 font-medium">Pertanyaan populer:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => handleQuickReply(qr.message)}
                    className="
                      text-xs px-3 py-1.5 rounded-full 
                      bg-white border border-primary-200 
                      text-primary-700 font-medium
                      hover:bg-primary-50 hover:border-primary-400
                      transition-all duration-200
                      active:scale-95
                    "
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================
              INPUT AREA - Form pengiriman pesan
              ============================================ */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-end gap-2">
              {/* 
                Textarea (bukan input biasa) agar bisa multi-baris.
                rows={1} agar awalnya hanya 1 baris.
              */}
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda..."
                rows={1}
                disabled={isTyping} // Nonaktifkan saat bot sedang memproses
                className="
                  flex-1 resize-none rounded-xl 
                  border border-gray-200 
                  px-4 py-3 text-sm text-gray-700
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-all duration-200
                  max-h-[100px] overflow-y-auto chat-scroll
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                "
                style={{ 
                  // Auto-resize textarea berdasarkan konten
                  height: 'auto' 
                }}
              />

              {/* Tombol Kirim */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping} // Nonaktif jika input kosong atau bot mengetik
                className="
                  w-11 h-11 flex-shrink-0
                  bg-primary-800 hover:bg-primary-700
                  disabled:bg-gray-200 disabled:cursor-not-allowed
                  text-white rounded-xl
                  flex items-center justify-center
                  transition-all duration-200
                  active:scale-90
                "
                aria-label="Kirim pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Petunjuk shortcut keyboard */}
            <p className="text-[10px] text-gray-300 mt-1.5 text-center">
              Tekan <kbd className="bg-gray-100 text-gray-400 px-1 rounded text-[10px]">Enter</kbd> untuk kirim
            </p>
          </div>
        </div>
      )}

      {/* ================================================
          TOMBOL TOGGLE CHATBOT (FAB - Floating Action Button)
          Ini adalah tombol bulat yang selalu terlihat di sudut kanan bawah.
          Menggunakan animasi pulse-green untuk menarik perhatian.
          ================================================ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-14 h-14 rounded-full
          bg-primary-800 hover:bg-primary-700
          text-white
          flex items-center justify-center
          shadow-chatbot
          transition-all duration-300
          hover:scale-110 active:scale-95
          ${!isOpen ? 'animate-pulse-green' : ''}
        `}
        aria-label={isOpen ? 'Tutup chatbot' : 'Buka chatbot'}
        aria-expanded={isOpen}
      >
        {/* Toggle ikon antara MessageCircle dan X */}
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-0'}`}>
          {isOpen 
            ? <X className="w-6 h-6" /> 
            : <MessageCircle className="w-6 h-6" />
          }
        </div>

        {/* 
          NOTIFIKASI (titik merah) 
          Muncul saat hasNotification = true dan chat tertutup
          Memberikan sinyal visual bahwa ada pesan baru
        */}
        {hasNotification && !isOpen && (
          <div className="
            absolute -top-1 -right-1
            w-4 h-4 bg-red-500 
            rounded-full border-2 border-white
            flex items-center justify-center
            animate-bounce
          ">
            <span className="text-white text-[8px] font-bold">1</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
