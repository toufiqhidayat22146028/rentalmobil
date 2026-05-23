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
      // PALET WARNA KUSTOM TEMA PUTIH & HIJAU GELAP
      // ==========================================
      colors: {
        primary: {
          50:  '#f0fdf4',  // Hijau sangat muda (background ringan)
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Hijau standar
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',  // Hijau gelap (warna utama)
          900: '#14532d',  // Hijau sangat gelap
          950: '#052e16',  // Hijau paling gelap
        },
        // Alias pendek untuk kemudahan penggunaan
        darkGreen: '#166534',   // Warna utama Hijau Gelap
        midGreen:  '#16a34a',   // Hijau menengah untuk hover
        lightGreen:'#dcfce7',   // Hijau sangat muda untuk background
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
        'card': '0 4px 20px rgba(22, 101, 52, 0.12)',  // Shadow hijau gelap
        'chatbot': '0 10px 40px rgba(0,0,0,0.15)',
      },
      // ==========================================
      // ANIMASI KUSTOM UNTUK CHATBOT & UI
      // ==========================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both',
        'pulse-green': 'pulseGreen 2s infinite',
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
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(22, 101, 52, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(22, 101, 52, 0)' },
        },
      },
    },
  },
  plugins: [],
}
