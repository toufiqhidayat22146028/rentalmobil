// ============================================================
// KOMPONEN: ChatMessage
// Menampilkan satu pesan individual di dalam chat window.
// Mendukung tiga tipe: 'user' (kanan), 'bot' (kiri), dan 'admin' (kiri).
// ============================================================
import { Bot, User, Headset } from 'lucide-react';

// Helper: Format timestamp ISO menjadi format jam yang mudah dibaca
const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
};

// Helper: Mengubah teks markdown sederhana menjadi HTML
const parseMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

const ChatMessage = ({ message, onSuggestionClick }) => {
  const role = message.role || 'bot';
  const isUser = role === 'user';
  const isAdmin = role === 'admin';
  const suggestions = message.suggestions || [];

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* AVATAR */}
      <div className={`
        flex-shrink-0 w-7 h-7 rounded-full 
        flex items-center justify-center
        ${isUser 
          ? 'bg-primary-800' 
          : isAdmin
            ? 'bg-blue-600 shadow-sm shadow-blue-500/10'
            : 'bg-gray-100 border border-gray-200'
        }
      `}>
        {isUser 
          ? <User className="w-3.5 h-3.5 text-white" />
          : isAdmin
            ? <Headset className="w-3.5 h-3.5 text-white" />
            : <Bot className="w-3.5 h-3.5 text-primary-700" />
        }
      </div>

      {/* GELEMBUNG PESAN */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        
        {/* Label Pengirim (hanya untuk Non-User) */}
        {!isUser && (
          <span className={`text-[10px] font-bold px-1 ${isAdmin ? 'text-blue-600' : 'text-gray-400'}`}>
            {isAdmin ? 'Admin' : 'Bot'}
          </span>
        )}

        {/* Bubble utama */}
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser 
            ? 'bg-primary-800 text-white rounded-br-sm' 
            : isAdmin
              ? 'bg-blue-50 text-slate-700 border border-blue-100 shadow-sm rounded-bl-sm'
              : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-sm'
          }
        `}>
          <span 
            dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
          />

          {suggestions.length > 0 && !isUser && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp || message.createdAt || message.created_at)}
        </span>
      </div>
    </div>
  );
};

// ============================================================
// KOMPONEN: TypingIndicator
// ============================================================
export const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
      <Bot className="w-3.5 h-3.5 text-primary-700" />
    </div>
    
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot animation-delay-200" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot animation-delay-400" />
      </div>
    </div>
  </div>
);
export default ChatMessage;
