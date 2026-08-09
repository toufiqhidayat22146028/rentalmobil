/** @type {import('tailwindcss').Config} */
export default {
  // Tentukan file mana saja yang akan di-scan oleh Tailwind untuk mendeteksi class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ==========================================
      // PALET WARNA KUSTOM TEMA LUXURY SLATE & ROYAL INDIGO
      // ==========================================
      colors: {
        primary: {
          50:  '#f8fafc',  // Slate sangat muda (background)
          100: '#f1f5f9',  // Slate 100
          200: '#e2e8f0',  // Slate 200
          300: '#cbd5e1',  // Slate 300
          400: '#94a3b8',  // Slate 400
          500: '#2563eb',  // Royal Blue (Aksen Utama untuk Link/Aktif)
          600: '#1d4ed8',  // Royal Blue Hover
          700: '#0369a1',  // Sky Blue 700 (Warna gelap tombol/teks)
          800: '#0284c7',  // Sky Blue 600 (Warna utama gelap premium)
          900: '#0ea5e9',  // Sky Blue 500 (Hitam Obsidian)
          950: '#000000',  // Hitam Murni
        },
        // Alias pendek untuk kemudahan penggunaan (dipetakan ke skema warna baru agar kompatibel)
        darkGreen: '#0f172a',   // Dipetakan ke Slate 900
        midGreen:  '#2563eb',   // Dipetakan ke Royal Blue
        lightGreen:'#f1f5f9',   // Dipetakan ke Slate 100
      },
      // ==========================================
      // FONT FAMILY - Menggunakan Google Fonts 'Inter'
      // ==========================================
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      // ==========================================
      // BOX SHADOW KUSTOM - Untuk efek card premium
      // ==========================================
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card': '0 4px 20px rgba(15, 23, 42, 0.08)',  // Shadow slate gelap
        'chatbot': '0 10px 40px rgba(0,0,0,0.15)',
      },
      // ==========================================
      // ANIMASI KUSTOM UNTUK CHATBOT & UI
      // ==========================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both',
        'pulse-blue': 'pulseBlue 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        pulseBlue: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(37, 99, 235, 0)' },
        },
      },
    },
  },
  plugins: [],
}
