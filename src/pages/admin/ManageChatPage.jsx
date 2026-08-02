// ============================================================
// HALAMAN: ManageChatPage (Admin)
// Halaman admin untuk mengelola percakapan live chat.
// Layout 2 kolom: daftar percakapan (kiri) & detail chat (kanan).
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  X, 
  CheckCheck, 
  Clock, 
  User, 
  Bot, 
  Headset, 
  XCircle, 
  RotateCcw, 
  Inbox,
  Loader2,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChatMessage from '../../components/chatbot/ChatMessage';

// Helper: Format waktu exact (misal 15:30)
const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Helper: Huruf inisial avatar
const getInitial = (name) => {
  return name?.charAt(0)?.toUpperCase() || 'U';
};

// Helper: Warna gradien avatar
const getAvatarGradient = (name) => {
  const colors = [
    'from-blue-600 to-indigo-500',
    'from-indigo-600 to-purple-500',
    'from-purple-600 to-pink-500',
    'from-pink-600 to-rose-500',
    'from-teal-600 to-emerald-500',
    'from-amber-600 to-orange-500',
  ];
  const charCodeSum = (name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

const ManageChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const selectedConvIdRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Mobile navigation helper: 'list' (daftar chat) atau 'detail' (isi chat)
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll ke pesan terbawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // 1. Fetch daftar percakapan
  const fetchConversations = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoadingList(true);
    try {
      const res = await chatAPI.getConversations();
      if (res.data.success) {
        setConversations(prev => {
          // Hitung unread lama vs baru untuk trigger notifikasi suara
          const prevUnread = prev.reduce((acc, c) => acc + (c.unread_count || c.unreadCount || 0), 0);
          const newUnread = res.data.data.reduce((acc, c) => acc + (c.unread_count || c.unreadCount || 0), 0);
          if (newUnread > prevUnread) {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(e => console.log('Audio autoplay blocked', e));
            } catch(e) {}
          }
          return res.data.data;
        });
        // Jika percakapan yang sedang aktif memiliki pesan baru, tandai sebagai dibaca
        const activeId = selectedConvIdRef.current;
        if (activeId) {
          const activeConv = res.data.data.find(c => c.id === activeId);
          if (activeConv && (activeConv.unread_count > 0 || activeConv.unreadCount > 0)) {
            try {
              await chatAPI.markAsRead(activeConv.id);
              // Panggil lagi untuk refresh state
              const updatedRes = await chatAPI.getConversations();
              if (updatedRes.data.success) setConversations(updatedRes.data.data);
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Admin Chat] Gagal mengambil percakapan:', err);
    } finally {
      if (showLoading) setIsLoadingList(false);
    }
  }, []);

  // 2. Fetch pesan di percakapan terpilih
  const fetchMessages = useCallback(async (convId, showLoading = false) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const res = await chatAPI.getMessages(convId);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('[Admin Chat] Gagal mengambil pesan:', err);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  }, []);

  // Load awal
  useEffect(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  // Polling daftar percakapan (setiap 10 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Polling pesan percakapan aktif (setiap 5 detik)
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id, false);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation, fetchMessages]);

  // Aksi ketika memilih percakapan
  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    selectedConvIdRef.current = conv.id;
    setMobileView('detail');
    await fetchMessages(conv.id, true);
    
    // Tandai sudah dibaca jika ada pesan unread
    const unread = conv.unread_count || conv.unreadCount || 0;
    if (unread > 0) {
      try {
        await chatAPI.markAsRead(conv.id);
        fetchConversations(false);
      } catch (err) {
        console.error('[Admin Chat] Gagal menandai dibaca:', err);
      }
    }
  };

  // Kirim balasan admin
  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending || !selectedConversation) return;

    setIsSending(true);
    try {
      const res = await chatAPI.sendMessage(selectedConversation.id, trimmed, 'admin');
      if (res.data.success) {
        setInputText('');
        // Tambahkan ke pesan lokal secara dinamis
        setMessages((prev) => [...prev, ...res.data.data]);
        // Refresh daftar percakapan untuk mengupdate pratinjau pesan terakhir
        fetchConversations(false);
        // Fokuskan kembali input
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch (err) {
      console.error('[Admin Chat] Gagal mengirim pesan:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Kirim pesan dengan Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Aksi Tutup Percakapan
  const handleCloseConversation = async (id) => {
    if (!window.confirm('Tutup percakapan ini?')) return;
    try {
      await chatAPI.closeConversation(id);
      setSelectedConversation((prev) => prev ? { ...prev, status: 'closed' } : null);
      fetchConversations(false);
    } catch (err) {
      console.error('[Admin Chat] Gagal menutup percakapan:', err);
    }
  };

  // Aksi Buka Kembali Percakapan
  const handleReopenConversation = async (id) => {
    try {
      await chatAPI.reopenConversation(id);
      setSelectedConversation((prev) => prev ? { ...prev, status: 'active' } : null);
      fetchConversations(false);
    } catch (err) {
      console.error('[Admin Chat] Gagal membuka percakapan:', err);
    }
  };

  // Aksi Hapus Percakapan
  const handleDeleteConversation = async (id) => {
    if (!window.confirm('Hapus percakapan ini secara permanen?')) return;
    try {
      await chatAPI.deleteConversation(id);
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
        selectedConvIdRef.current = null;
        setMessages([]);
      }
      fetchConversations(false);
    } catch (err) {
      console.error('[Admin Chat] Gagal menghapus percakapan:', err);
    }
  };

  // Filter percakapan berdasarkan pencarian nama user
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const userName = c.user_name || c.user?.name || c.userName || '';
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Komponen daftar percakapan di sebelah kiri
  const conversationListJSX = (
    <div className={`w-full lg:w-96 border-r border-slate-200/50 flex flex-col h-full bg-white ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
      {/* Header Panel Kiri */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-display font-bold text-slate-800">Kelola Chat</h2>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-full">
          {conversations.length}
        </span>
      </div>

      {/* Input Pencarian */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* List Item Percakapan */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/70">
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-400">Memuat percakapan...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <Inbox className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada percakapan</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada obrolan dari pengguna saat ini.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const userName = conv.user_name || conv.user?.name || conv.userName || 'Pengguna';
            const lastMsg = conv.last_message || conv.lastMessage || '';
            const lastTime = conv.last_message_at || conv.updated_at || conv.created_at;
            const unreadCount = conv.unread_count || conv.unreadCount || 0;
            const isActive = conv.status === 'active';
            const isSelected = selectedConversation?.id === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 flex gap-3.5 cursor-pointer hover:bg-slate-50/50 transition-all relative ${
                  isSelected ? 'bg-blue-50/30 border-l-4 border-blue-600 pl-3' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm bg-gradient-to-br flex-shrink-0 ${getAvatarGradient(userName)}`}>
                  {getInitial(userName)}
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <p className="text-sm font-bold text-slate-700 truncate leading-snug">{userName}</p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{getRelativeTime(lastTime)}</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 truncate max-w-[95%] leading-normal mb-1.5">{lastMsg || 'Memulai percakapan baru'}</p>

                  <div className="flex items-center gap-1.5">
                    {/* Status */}
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {isActive ? 'Aktif' : 'Tutup'}
                    </span>
                  </div>
                </div>

                {/* Badge Unread */}
                {unreadCount > 0 && (
                  <div className="absolute right-4 bottom-4 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                    <span className="text-white text-[9px] font-bold">{unreadCount}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Komponen detail chat di sebelah kanan
  const chatDetailJSX = (
    <div className={`flex-1 flex flex-col h-full bg-slate-50 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
      {selectedConversation ? (
        <>
          {/* Header Chat Detail */}
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              {/* Back button for mobile view */}
              <button
                onClick={() => setMobileView('list')}
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 mr-1"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm bg-gradient-to-br ${getAvatarGradient(selectedConversation.user_name || selectedConversation.userName)}`}>
                {getInitial(selectedConversation.user_name || selectedConversation.userName)}
              </div>
              
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight">
                  {selectedConversation.user_name || selectedConversation.userName}
                </p>
                <p className="text-[10.5px] text-slate-400 font-medium">
                  {selectedConversation.user_email || 'No email'}
                </p>
              </div>
            </div>

            {/* Aksi status percakapan */}
            <div className="flex items-center gap-2">
              {selectedConversation.status === 'active' ? (
                <button
                  onClick={() => handleCloseConversation(selectedConversation.id)}
                  className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-100 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tutup Percakapan</span>
                </button>
              ) : (
                <button
                  onClick={() => handleReopenConversation(selectedConversation.id)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-2 rounded-xl border border-blue-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Buka Kembali</span>
                </button>
              )}
              
              <button
                onClick={() => handleDeleteConversation(selectedConversation.id)}
                className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-2 rounded-xl border border-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Pesan-pesan Viewport */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm text-slate-400">Memuat pesan...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <p>Belum ada pesan di percakapan ini.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={{ ...msg, role: msg.senderRole || msg.sender_role || msg.role }} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Balasan Admin di bawah */}
          <div className="p-4 bg-white border-t border-slate-100 shadow-md">
            {selectedConversation.status === 'closed' ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 text-center text-xs font-semibold">
                🔒 Percakapan ini telah ditutup. Silakan klik "Buka Kembali" di atas untuk mengirim pesan.
              </div>
            ) : (
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik balasan Anda di sini..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all max-h-24 chat-scroll"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="w-12 h-12 flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-150 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 active:scale-95 transition-all"
                  aria-label="Kirim balasan"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
          <MessageSquare className="w-14 h-14 text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-600">Percakapan Belum Dipilih</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">Silakan pilih salah satu percakapan di panel sebelah kiri untuk melihat pesan dan mulai membalas.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-160px)] flex rounded-2xl overflow-hidden border border-slate-200/50 bg-white shadow-sm">
      {conversationListJSX}
      {chatDetailJSX}
    </div>
  );
};

export default ManageChatPage;
