import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Bot,
  User,
  RotateCcw,
  LogIn
} from 'lucide-react';
import ChatMessage, { TypingIndicator } from './ChatMessage';
import {
  WELCOME_MESSAGE,
  ADMIN_CONTACT,
  getLocalBotResponse,
  getBotResponse,
  updateFAQData,
  MAIN_MENU_REPLIES,
  CAR_MENU_REPLIES,
  PRICE_MENU_REPLIES,
  BOOKING_MENU_REPLIES,
  REQUIREMENTS_MENU_REPLIES
} from '../../data/chatbotFAQ';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, carsAPI } from '../../services/api';

const attachSuggestions = (msgs) => {
  return msgs.map((msg, i) => {
    if (msg.role === 'bot' && i === msgs.length - 1 && !msg.suggestions) {
      const prevUserMsg = i > 0 && msgs[i-1].role === 'user' ? msgs[i-1] : null;
      let finalSuggestions = MAIN_MENU_REPLIES;
      if (msg.content.includes('Maaf, saya belum mengerti')) {
        finalSuggestions = MAIN_MENU_REPLIES;
      } else if (prevUserMsg) {
        const botReply = getBotResponse(prevUserMsg.content);
        finalSuggestions = botReply.suggestions || MAIN_MENU_REPLIES;
      }
      return { ...msg, suggestions: finalSuggestions };
    }
    return msg;
  });
};

const ChatbotWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasNotification, setHasNotification] = useState(false);
  const [localAdminMode, setLocalAdminMode] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch dynamic cars on mount for guest users
  useEffect(() => {
    carsAPI.getAll()
      .then(res => {
        if (res.data.success && res.data.data) {
          updateFAQData(res.data.data);
        }
      })
      .catch(err => console.error('[Chatbot] Failed to fetch cars:', err));
  }, []);

  // Auto scroll ke bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen || messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Focus input saat chat dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNotification(false);
    }
  }, [isOpen]);

  // 1. Inisialisasi Percakapan (Buat atau ambil yang aktif)
  const fetchConversationMessages = useCallback(async (convId) => {
    try {
      const res = await chatAPI.getMessages(convId);
      if (res.data.success) {
        const msgs = res.data.data || [];
        if (msgs.length > 0) {
          const processedMsgs = attachSuggestions(msgs);
          setMessages(processedMsgs);
        }
      }
    } catch (err) {
      console.error('[Chatbot] Gagal mengambil pesan percakapan:', err);
    }
  }, []);

  const initConversation = useCallback(async () => {
    if (!user) {
      setIsBackendAvailable(false);
      return null;
    }
    setIsConversationLoading(true);

    try {
      const res = await chatAPI.createConversation();
      if (res.data.success) {
        const conv = res.data.data;
        const msgs = conv.messages && conv.messages.length > 0 ? conv.messages : [WELCOME_MESSAGE];
        const processedMsgs = attachSuggestions(msgs);
        setMessages(processedMsgs);
        setConversationId(conv.conversation.id);
        setErrorMessage('');
        setIsBackendAvailable(true);
        setLocalAdminMode(false);
        return conv.conversation.id;
      }
    } catch (err) {
      console.error('[Chatbot] Gagal inisialisasi percakapan, beralih ke mode lokal.');
      setIsBackendAvailable(false);
    } finally {
      setIsConversationLoading(false);
    }
    return null;
  }, [user]);

  // Update effect untuk reset penuh saat logout
  useEffect(() => {
    if (!user) {
      setConversationId(null);
      setMessages([]);
      setErrorMessage('');
      setIsBackendAvailable(true);
      setLocalAdminMode(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen || !isBackendAvailable) return;
    if (!conversationId && !isConversationLoading) {
      initConversation();
      return;
    }

    if (!conversationId) return;
    fetchConversationMessages(conversationId);
    const interval = setInterval(async () => {
      try {
        const res = await chatAPI.getMessages(conversationId);
        if (res.data.success) {
          const backendMessages = res.data.data;
          
          const isDifferent = backendMessages.length !== messages.length || 
            backendMessages.some((bMsg, i) => {
              const lMsg = messages[i];
              if (!lMsg) return true;
              return bMsg.is_read !== lMsg.is_read || bMsg.isRead !== lMsg.isRead || bMsg.id !== lMsg.id;
            });

          if (isDifferent) {
            const processedMsgs = attachSuggestions(backendMessages);
            
            if (!isOpen && backendMessages.length > messages.length) {
              setHasNotification(true);
            }
            setMessages(processedMsgs);
          }
        }
      } catch (err) {
        console.error('[Chatbot] Polling pesan gagal:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, conversationId, fetchConversationMessages, isBackendAvailable, messages.length]);

  // Command handlers
  const handleNewChat = async () => {
    if (!user) {
      setMessages([WELCOME_MESSAGE]);
      setConversationId(null);
      setLocalAdminMode(false);
      return;
    }
    
    setIsConversationLoading(true);
    setErrorMessage('');
    
    try {
      if (conversationId) {
        await chatAPI.closeConversation(conversationId);
      }
      const res = await chatAPI.createConversation({ forceNew: true });
      if (res.data.success) {
        const conv = res.data.data;
        setConversationId(conv.conversation.id);
        const msgs = conv.messages && conv.messages.length > 0 ? conv.messages : [WELCOME_MESSAGE];
        const processedMsgs = attachSuggestions(msgs);
        setMessages(processedMsgs);
        setIsBackendAvailable(true);
        setLocalAdminMode(false);
      }
    } catch (err) {
      console.error('[Chatbot] Gagal membuat obrolan baru:', err);
      setMessages([WELCOME_MESSAGE]);
      setConversationId(null);
      setIsBackendAvailable(false);
      setLocalAdminMode(false);
    } finally {
      setIsConversationLoading(false);
    }
  };

  const handleShowHistory = async () => {
    if (!user) {
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: 'bot',
        content: 'Maaf, fitur Riwayat Chat hanya tersedia jika Anda sudah login.',
        timestamp: new Date().toISOString(),
      }]);
      return;
    }

    try {
      const res = await chatAPI.getHistory();
      if (res.data.success) {
        const history = res.data.data;
        if (history.length === 0) {
          setMessages(prev => [...prev, {
            id: `bot-hist-${Date.now()}`,
            role: 'bot',
            content: 'Belum ada riwayat percakapan sebelumnya.',
            timestamp: new Date().toISOString(),
          }]);
          return;
        }

        const historyLines = history.slice(0, 5).map((h, i) => 
          `• Obrolan ${i+1} (${new Date(h.createdAt).toLocaleDateString()}) - ${h.last_message ? h.last_message.substring(0,20)+'...' : 'Obrolan kosong'}`
        );

        setMessages(prev => [...prev, {
          id: `bot-hist-${Date.now()}`,
          role: 'bot',
          content: `🕘 **Riwayat Chat**\n\nBerikut riwayat percakapan Anda:\n\n${historyLines.join('\n')}\n\nFitur untuk membuka ulang sesi sebelumnya masih dalam pengembangan.`,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('[Chatbot] Gagal memuat riwayat:', err);
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: 'bot',
        content: 'Maaf, gagal memuat riwayat obrolan dari server.',
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  // Kirim pesan user
  const handleSendMessage = async (text = inputText, nextKey = null) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMessage('Silakan ketik pesan terlebih dahulu.');
      return;
    }

    if (nextKey === 'newChat' || trimmed === 'Buat Obrolan Baru') {
      handleNewChat();
      return;
    }

    if (nextKey === 'history' || trimmed === 'Riwayat Chat') {
      handleShowHistory();
      return;
    }

    setErrorMessage('');
    setInputText('');

    const userTempMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userTempMsg]);
    setIsTyping(true);

    const sendLocalResponse = () => {
      // Jika user sudah masuk local admin mode, jangan balas lagi
      if (localAdminMode) return;

      const detectedKey = nextKey || detectNextReplySet(trimmed);
      const response = getLocalBotResponse(detectedKey, trimmed);
      
      // Deteksi jika user meminta admin
      if (detectedKey === 'admin' || response.next === 'admin') {
        setLocalAdminMode(true);
      }
      
      if (!user && (detectedKey === 'admin' || response.next === 'admin')) {
        response.content = '👨‍💼 **Pemberitahuan:**\n\nAnda sedang mengakses chat sebagai tamu. Agar pesan Anda dapat terhubung langsung dan dibalas oleh Admin kami, silakan **Login** terlebih dahulu. Anda tetap bisa menggunakan menu chat otomatis kami di bawah ini.';
        response.suggestions = [{ id: 'login-hint', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' }];
        // Izinkan bot merespon lagi jika mereka tamu (jangan lock)
        setLocalAdminMode(false);
      }

      const botTempMsg = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: response.content,
        suggestions: response.suggestions || [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botTempMsg]);
    };

    try {
      if (!isBackendAvailable) {
        throw new Error('Backend offline');
      }

      let convId = conversationId;
      if (!convId) {
        convId = await initConversation();
        if (!convId) {
          throw new Error('Conversation initialization failed');
        }
        setConversationId(convId);
      }

      const res = await chatAPI.sendMessage(convId, trimmed, 'user');
      setIsBackendAvailable(true);

      if (res.data.success) {
        const returnedMessages = res.data.data || [];
        const botMessages = returnedMessages.filter((msg) => msg.role === 'bot');

        if (botMessages.length > 0) {
          const localMatch = getLocalBotResponse(nextKey || detectNextReplySet(trimmed), trimmed);
          const messagesWithSuggestions = botMessages.map(msg => ({
            ...msg,
            suggestions: msg.suggestions || localMatch.suggestions || [],
          }));
          setMessages((prev) => [...prev, ...messagesWithSuggestions]);
        }
        return; // Message successfully sent to backend, admin might reply later
      }

      throw new Error('Gagal mengirim pesan ke server');
    } catch (err) {
      // Gunakan respons lokal secara diam-diam tanpa memunculkan pesan error di UI
      sendLocalResponse();
      setIsBackendAvailable(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset Percakapan
  const closeCurrentSession = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setConversationId(null);
      setErrorMessage('');
      return;
    }

    try {
      await chatAPI.closeConversation(conversationId);
    } catch (err) {
      console.error('[Chatbot] Gagal menutup session:', err);
    } finally {
      setMessages([]);
      setConversationId(null);
      setErrorMessage('');
      setIsBackendAvailable(true);
    }
  }, [conversationId]);

  const handleReset = async () => {
    if (!window.confirm('Mulai obrolan baru? Riwayat obrolan Anda sebelumnya akan direset.')) return;
    await closeCurrentSession();
    await initConversation();
  };

  const handleCloseChat = async () => {
    // Hanya tutup widget, jangan hapus sesi
    setIsOpen(false);
  };

  const detectNextReplySet = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('lihat mobil') || lower.includes('mobil') || lower.includes('lihat semua mobil')) {
      return 'cars';
    }
    if (lower.includes('harga') || lower.includes('sewa')) {
      return 'price';
    }
    if (lower.includes('cara booking') || lower.includes('booking') || lower.includes('jadwal booking')) {
      return 'booking';
    }
    if (lower.includes('syarat') || lower.includes('persyaratan')) {
      return 'requirements';
    }
    if (lower.includes('pengembalian') || lower.includes('kembali') || lower.includes('late') || lower.includes('terlambat')) {
      return 'return';
    }
    if (lower.includes('lokasi') || lower.includes('kontak') || lower.includes('alamat')) {
      return 'location';
    }
    if (lower.includes('hubungi admin') || lower.includes('chat admin') || lower.includes('telepon admin') || lower.includes('admin')) {
      return 'admin';
    }
    if (lower.includes('booking sekarang') || lower.includes('lanjutkan booking') || lower.includes('pesan')) {
      return 'postBooking';
    }
    if (lower.includes('terima kasih') || lower.includes('berhasil') || lower.includes('konfirmasi')) {
      return 'confirmation';
    }
    if (lower.includes('menu utama') || lower.includes('utama')) {
      return 'main';
    }
    return 'main';
  };

  const displayedMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* PANEL CHAT */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] bg-white rounded-2xl shadow-chatbot border border-gray-100 flex flex-col overflow-hidden animate-slide-up max-h-[540px]">
          {/* HEADER CHAT */}
          {/* 
            [SIDANG SKRIPSI INFO] 
            Jika dosen bertanya: "Bagaimana cara mengubah warna biru di atas chatbot?"
            Jawaban: "Di file ChatbotWidget.jsx, baris ini menggunakan Tailwind CSS 'bg-gradient-to-r from-blue-600 to-blue-500'."
          */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-slate-900 rounded-full" />
              </div>
              
              <div>
                <p className="text-white font-semibold text-sm leading-tight">SBS Rentcar</p>
                <p className="text-slate-300 text-xs">Online • Siap membantu</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Mulai percakapan baru"
                aria-label="Reset percakapan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleCloseChat}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup chat"
                aria-label="Tutup chatbot"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AREA PESAN */}
          <>
              {/* LIST GELEMBUNG PESAN */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50 min-h-[300px] max-h-[340px] chat-scroll">
                {displayedMessages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={{
                      ...message,
                      // Map properti agar cocok dengan prop yang diterima ChatMessage
                      role: message.role || message.senderRole || message.sender_role,
                      timestamp: message.timestamp || message.createdAt || message.created_at
                    }} 
                    onSuggestionClick={(suggestion) => handleSendMessage(suggestion.message, suggestion.next)}
                  />
                ))}

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* ERROR MESSAGE */}
              {errorMessage && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-2xl">
                  {errorMessage}
                </div>
              )}


              {/* INPUT AREA */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pertanyaan Anda..."
                    rows={1}
                    disabled={isTyping}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all max-h-[100px] overflow-y-auto chat-scroll disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isTyping}
                    className="w-11 h-11 flex-shrink-0 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md shadow-slate-950/10"
                    aria-label="Kirim pesan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Tekan <kbd className="bg-gray-100 text-gray-400 px-1 rounded text-[10px]">Enter</kbd> untuk kirim
                </p>
              </div>
            </>
        </div>
      )}

      <button
        onClick={async () => {
          if (isOpen) {
            await handleCloseChat();
            return;
          }
          setIsOpen(true);
        }}
        className={`relative w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-chatbot transition-all duration-300 hover:scale-110 active:scale-95 ${!isOpen ? 'animate-pulse-blue' : ''}`}
        aria-label={isOpen ? 'Tutup chatbot' : 'Buka chatbot'}
        aria-expanded={isOpen}
      >
        <div className="transition-transform duration-300">
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </div>

        {hasNotification && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
            <span className="text-white text-[8px] font-bold">1</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
