// ============================================================
// KOMPONEN: ChatMessage
// Menampilkan satu pesan individual di dalam chat window.
// Mendukung dua tipe: 'user' (kanan) dan 'bot' (kiri).
// Props:
//   - message: { role: 'user'|'bot', content: string, timestamp: string }
// ============================================================
import { Bot, User } from 'lucide-react';

// Helper: Format timestamp ISO menjadi format jam yang mudah dibaca
// Contoh: "2024-01-15T09:30:00.000Z" -> "09:30"
const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Helper: Mengubah teks markdown sederhana menjadi HTML
// Mendukung: **bold**, *italic*, dan \n (newline)
const parseMarkdown = (text) => {
  return text
    // Ubah **teks** menjadi <strong>teks</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Ubah *teks* menjadi <em>teks</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Ubah baris baru (\n) menjadi tag <br>
    .replace(/\n/g, '<br>');
};

const ChatMessage = ({ message }) => {
  // Tentukan apakah pesan ini dari user atau dari bot
  const isUser = message.role === 'user';

  return (
    // Wrapper baris pesan - user di kanan (justify-end), bot di kiri
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* ================================================
          AVATAR - Ikon kecil di samping gelembung pesan
          ================================================ */}
      <div className={`
        flex-shrink-0 w-7 h-7 rounded-full 
        flex items-center justify-center
        ${isUser 
          ? 'bg-primary-800'    // Avatar user: hijau gelap
          : 'bg-gray-100 border border-gray-200' // Avatar bot: abu-abu
        }
      `}>
        {isUser 
          ? <User className="w-3.5 h-3.5 text-white" />
          : <Bot className="w-3.5 h-3.5 text-primary-700" />
        }
      </div>

      {/* ================================================
          GELEMBUNG PESAN (CHAT BUBBLE)
          ================================================ */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        
        {/* Bubble utama */}
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser 
            ? 'bg-primary-800 text-white rounded-br-sm'  // Bubble user: hijau gelap, pojok kanan bawah flat
            : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-sm' // Bubble bot: putih, pojok kiri bawah flat
          }
        `}>
          {/* 
            Render konten pesan sebagai HTML 
            Menggunakan dangerouslySetInnerHTML agar tag <br> dan <strong> 
            dari parseMarkdown() bisa ditampilkan dengan benar.
            CATATAN: Ini aman karena konten berasal dari data internal (bukan input eksternal).
          */}
          <span 
            dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
          />
        </div>

        {/* Timestamp - muncul di bawah bubble */}
        <span className={`text-[10px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

// ============================================================
// KOMPONEN: TypingIndicator
// Animasi "sedang mengetik" yang muncul saat bot memproses pesan
// Ditampilkan sebagai 3 titik yang bergerak naik-turun
// ============================================================
export const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    {/* Avatar bot */}
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
      <Bot className="w-3.5 h-3.5 text-primary-700" />
    </div>
    
    {/* Bubble dengan animasi titik-titik */}
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex items-center gap-1">
        {/* Setiap titik memiliki animasi bounce dengan delay berbeda */}
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot animation-delay-200" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot animation-delay-400" />
      </div>
    </div>
  </div>
);

export default ChatMessage;
